import { useState, useEffect } from "react";
import { FaTimes, FaPaperPlane, FaUser } from "react-icons/fa";
import api from "../../lib/api";

export default function ComposeMessageModal({
  isOpen,
  onClose,
  onMessageSent,
  replyTo = null,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    recipientId: replyTo?.sender?.id || "",
    subject: replyTo ? `Re: ${replyTo.subject || "(no subject)"}` : "",
    body: "",
  });

  // Load users when modal opens
  useEffect(() => {
    if (isOpen && !replyTo) {
      loadUsers();
    }
  }, [isOpen, replyTo]);

  async function loadUsers() {
    try {
      const response = await api.getUsers();
      console.log("Loaded users:", response.data); // Debug log
      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users list");
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (replyTo) {
        // Reply to existing message
        await api.replyToMessage(replyTo.id, {
          body: formData.body,
          subject: formData.subject,
        });
      } else {
        // Send new message
        await api.sendMessage(formData);
      }

      // Reset form
      setFormData({
        recipientId: "",
        subject: "",
        body: "",
      });

      // Notify parent
      if (onMessageSent) {
        onMessageSent();
      }

      // Close modal
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Get selected user for preview
  const selectedUser = users.find((u) => u.id === formData.recipientId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {replyTo ? "Reply to Message" : "Compose Message"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Show original message if replying */}
          {replyTo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3 mb-3">
                {/* Sender Profile Image */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {replyTo.sender.profileImage ? (
                    <img
                      src={replyTo.sender.profileImage}
                      alt={`${replyTo.sender.firstName} ${replyTo.sender.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaUser className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {replyTo.sender.firstName} {replyTo.sender.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {replyTo.sender.position || "Staff"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">
                {replyTo.body.length > 200
                  ? `${replyTo.body.substring(0, 200)}...`
                  : replyTo.body}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient (only for new messages) */}
            {!replyTo && (
              <div>
                <label className="label">To: *</label>
                <select
                  name="recipientId"
                  value={formData.recipientId}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled={loading}
                >
                  <option value="">Select recipient...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                      {user.position && ` - ${user.position}`}
                    </option>
                  ))}
                </select>

                {/* Show selected user preview */}
                {selectedUser && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {/* Selected User Profile Image */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {selectedUser.profileImage ? (
                          <img
                            src={selectedUser.profileImage}
                            alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaUser className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </p>
                        {selectedUser.position && (
                          <p className="text-sm text-gray-600">
                            {selectedUser.position}
                          </p>
                        )}
                        {selectedUser.email && (
                          <p className="text-xs text-gray-500">
                            {selectedUser.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If replying, show recipient preview */}
            {replyTo && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Replying to:</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {replyTo.sender.profileImage ? (
                      <img
                        src={replyTo.sender.profileImage}
                        alt={`${replyTo.sender.firstName} ${replyTo.sender.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaUser className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {replyTo.sender.firstName} {replyTo.sender.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {replyTo.sender.position || "Staff"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="label">Subject:</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input"
                placeholder="Message subject (optional)"
                disabled={loading}
              />
            </div>

            {/* Body */}
            <div>
              <label className="label">Message: *</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                className="input"
                rows="8"
                placeholder="Type your message here..."
                required
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <FaPaperPlane className="inline mr-2" />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
