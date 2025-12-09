import { useState, useEffect } from "react";
import Link from "next/link";
import { withAuth } from "../../lib/auth";
import Layout from "../../components/layout/Layout";
import ComposeMessageModal from "../../components/messages/ComposeMessageModal";
import useSWR from "swr";
import api from "../../lib/api";
import {
  FaInbox,
  FaPaperPlane,
  FaPlus,
  FaEnvelope,
  FaEnvelopeOpen,
  FaTrash,
  FaReply,
  FaUser,
} from "react-icons/fa";
import { format } from "date-fns";

function MessagesPage() {
  const [activeTab, setActiveTab] = useState("inbox"); // 'inbox' or 'sent'
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch inbox
  const {
    data: inboxData,
    error: inboxError,
    mutate: mutateInbox,
  } = useSWR(
    activeTab === "inbox" ? `/messages/inbox?page=${page}&limit=20` : null,
    () => api.getInbox({ page, limit: 20 })
  );

  // Fetch sent messages
  const {
    data: sentData,
    error: sentError,
    mutate: mutateSent,
  } = useSWR(
    activeTab === "sent" ? `/messages/sent?page=${page}&limit=20` : null,
    () => api.getSentMessages({ page, limit: 20 })
  );

  // Fetch unread count
  const { data: unreadData, mutate: mutateUnread } = useSWR(
    "/messages/unread-count",
    () => api.getUnreadCount()
  );

  const messages = activeTab === "inbox" ? inboxData?.data : sentData?.data;
  const pagination =
    activeTab === "inbox" ? inboxData?.pagination : sentData?.pagination;
  const error = activeTab === "inbox" ? inboxError : sentError;
  const unreadCount = unreadData?.data?.count || 0;

  // Handle message sent
  const handleMessageSent = () => {
    mutateInbox();
    mutateSent();
    mutateUnread();
  };

  // Handle delete message
  const handleDelete = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await api.deleteMessage(messageId);
      mutateInbox();
      mutateSent();
      mutateUnread();
    } catch (err) {
      alert("Failed to delete message: " + err.message);
    }
  };

  // Handle mark as read/unread
  const handleToggleRead = async (messageId, isRead) => {
    try {
      if (isRead) {
        await api.markMessageAsUnread(messageId);
      } else {
        await api.markMessageAsRead(messageId);
      }
      mutateInbox();
      mutateUnread();
    } catch (err) {
      alert("Failed to update message: " + err.message);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-red-600">Failed to load messages</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Internal messaging system</p>
          </div>
          <button
            onClick={() => setShowComposeModal(true)}
            className="btn btn-primary"
          >
            <FaPlus className="inline mr-2" />
            New Message
          </button>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab("inbox");
                setPage(1);
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "inbox"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaInbox className="inline mr-2" />
              Inbox
              {unreadCount > 0 && (
                <span className="ml-2 badge badge-danger">{unreadCount}</span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("sent");
                setPage(1);
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "sent"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FaPaperPlane className="inline mr-2" />
              Sent
            </button>
          </div>

          {/* Messages List */}
          <div className="divide-y divide-gray-200">
            {!messages ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <FaEnvelope className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {activeTab === "inbox"
                    ? "No messages in inbox"
                    : "No sent messages"}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const otherUser =
                  activeTab === "inbox" ? message.sender : message.recipient;
                const isUnread = activeTab === "inbox" && !message.isRead;

                return (
                  <div
                    key={message.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      isUnread ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          {otherUser.profileImage ? (
                            <img
                              src={otherUser.profileImage}
                              alt={`${otherUser.firstName} ${otherUser.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FaUser className="text-2xl text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/messages/${message.id}`}
                              className="block hover:text-primary-600"
                            >
                              <div className="flex items-center space-x-2">
                                <p
                                  className={`font-medium ${
                                    isUnread ? "font-bold" : ""
                                  }`}
                                >
                                  {otherUser.firstName} {otherUser.lastName}
                                </p>
                                {otherUser.position && (
                                  <span className="text-sm text-gray-500">
                                    · {otherUser.position}
                                  </span>
                                )}
                                {isUnread && (
                                  <span className="badge badge-info">New</span>
                                )}
                              </div>
                              <p
                                className={`text-sm mt-1 ${
                                  isUnread
                                    ? "font-semibold text-gray-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {message.subject || "(no subject)"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {message.body}
                              </p>
                            </Link>
                          </div>

                          {/* Time */}
                          <div className="flex-shrink-0 ml-4 text-right">
                            <p className="text-xs text-gray-500">
                              {format(
                                new Date(message.createdAt),
                                "MMM d, h:mm a"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3 mt-2">
                          <Link
                            href={`/messages/${message.id}`}
                            className="text-sm text-primary-600 hover:text-primary-800"
                          >
                            View
                          </Link>

                          {activeTab === "inbox" && (
                            <>
                              <button
                                onClick={() =>
                                  handleToggleRead(message.id, message.isRead)
                                }
                                className="text-sm text-gray-600 hover:text-gray-900"
                              >
                                {message.isRead ? (
                                  <>
                                    <FaEnvelope className="inline mr-1" />
                                    Mark Unread
                                  </>
                                ) : (
                                  <>
                                    <FaEnvelopeOpen className="inline mr-1" />
                                    Mark Read
                                  </>
                                )}
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(message.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onMessageSent={handleMessageSent}
      />
    </Layout>
  );
}

export default withAuth(MessagesPage);
