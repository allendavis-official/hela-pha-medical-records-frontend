import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import ComposeMessageModal from "../../components/messages/ComposeMessageModal";
import useSWR from "swr";
import api from "../../lib/api";
import {
  FaArrowLeft,
  FaReply,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import { format } from "date-fns";

function MessageDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [showReplyModal, setShowReplyModal] = useState(false);

  const { data, error, mutate } = useSWR(id ? `/messages/${id}` : null, () =>
    api.getMessageById(id)
  );

  // Mark as read when viewing (if recipient)
  useState(() => {
    if (data?.data && !data.data.isRead) {
      api.markMessageAsRead(id).catch(console.error);
    }
  }, [data, id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await api.deleteMessage(id);
      router.push("/messages");
    } catch (err) {
      alert("Failed to delete message: " + err.message);
    }
  };

  const handleReplySuccess = () => {
    router.push("/messages");
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load message</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading message...</p>
        </div>
      </Layout>
    );
  }

  const message = data.data;
  const isRecipient = message.recipient.id === message.recipientId;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/messages" className="btn btn-secondary">
            <FaArrowLeft className="inline mr-2" />
            Back to Messages
          </Link>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowReplyModal(true)}
              className="btn btn-primary"
            >
              <FaReply className="inline mr-2" />
              Reply
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              <FaTrash className="inline mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Message Card */}
        <div className="card">
          {/* Subject */}
          <div className="border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {message.subject || "(no subject)"}
            </h1>
          </div>

          {/* Sender/Recipient Info */}
          <div className="flex items-start space-x-4 mb-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                {message.sender.profileImage ? (
                  <img
                    src={message.sender.profileImage}
                    alt={`${message.sender.firstName} ${message.sender.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-3xl text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg text-gray-900">
                    {message.sender.firstName} {message.sender.lastName}
                  </p>
                  {message.sender.position && (
                    <p className="text-sm text-gray-600">
                      {message.sender.position}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {message.sender.email}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    <FaClock className="inline mr-1" />
                    {format(new Date(message.createdAt), "MMM d, yyyy h:mm a")}
                  </p>
                  {message.isRead && message.readAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Read: {format(new Date(message.readAt), "MMM d, h:mm a")}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <strong>To:</strong> {message.recipient.firstName}{" "}
                {message.recipient.lastName}
                {message.recipient.position &&
                  ` (${message.recipient.position})`}
              </div>
            </div>
          </div>

          {/* Original Message (if this is a reply) */}
          {message.replyTo && (
            <div className="bg-gray-50 border-l-4 border-gray-300 p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong>In reply to:</strong> {message.replyTo.sender.firstName}{" "}
                {message.replyTo.sender.lastName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Subject:</strong>{" "}
                {message.replyTo.subject || "(no subject)"}
              </p>
              <p className="text-sm text-gray-700 italic">
                {message.replyTo.body}
              </p>
            </div>
          )}

          {/* Message Body */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-900">
              {message.body}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <ComposeMessageModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onMessageSent={handleReplySuccess}
        replyTo={message}
      />
    </Layout>
  );
}

export default withAuth(MessageDetailPage);
