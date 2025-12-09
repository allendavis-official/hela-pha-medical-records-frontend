// API Client for Hela PHA Backend
// Handles all HTTP requests to the backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  constructor() {
    this.baseUrl = API_URL;
  }

  // Get auth token from localStorage
  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  // Get headers with auth token
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Build query string from params object, preserving types
  buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) return "";

    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== "" && value !== null && value !== undefined) {
        cleanParams[key] = value;
      }
    });

    return new URLSearchParams(cleanParams).toString();
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.includeAuth !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // ===== AUTH ENDPOINTS =====
  async login(email, password) {
    return this.post("/auth/login", { email, password });
  }

  async getCurrentUser() {
    return this.get("/auth/me");
  }

  async logout() {
    return this.post("/auth/logout", {});
  }

  // ===== PATIENT ENDPOINTS =====
  async getPatients(params = {}) {
    const query = this.buildQueryString(params);
    return this.get(`/patients${query ? `?${query}` : ""}`);
  }

  async getPatientById(id) {
    return this.get(`/patients/${id}`);
  }

  async createPatient(data) {
    return this.post("/patients", data);
  }

  async updatePatient(id, data) {
    return this.put(`/patients/${id}`, data);
  }

  async deletePatient(id) {
    return this.delete(`/patients/${id}`);
  }

  // Archive patient
  async archivePatient(patientId) {
    return this.post(`/patients/${patientId}/archive`, {});
  }

  // Restore archived patient
  async restorePatient(patientId) {
    return this.post(`/patients/${patientId}/restore`, {});
  }

  async getPatientStatistics() {
    return this.get("/patients/statistics/summary");
  }

  // Upload patient image
  async uploadPatientImage(patientId, file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${this.baseUrl}/patients/${patientId}/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }
    return data;
  }

  // ===== ENCOUNTER ENDPOINTS =====
  async getEncounters(params = {}) {
    // Build query manually to avoid URLSearchParams converting numbers to strings
    const queryParts = [];
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== "" && value !== null && value !== undefined) {
        queryParts.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
    const query = queryParts.join("&");
    return this.get(`/encounters${query ? `?${query}` : ""}`);
  }

  async getEncounterById(id) {
    return this.get(`/encounters/${id}`);
  }

  async createEncounter(data) {
    return this.post("/encounters", data);
  }

  async closeEncounter(id, data) {
    return this.post(`/encounters/${id}/close`, data);
  }

  async getEncounterStatistics() {
    return this.get("/encounters/statistics/summary");
  }

  // ===== CLINICAL NOTES ENDPOINTS =====
  async getAllClinicalNotes(params = {}) {
    const query = this.buildQueryString(params);
    return this.get(`/clinical-notes${query ? `?${query}` : ""}`);
  }

  async getClinicalNotes(encounterId) {
    return this.get(`/clinical-notes/encounter/${encounterId}`);
  }

  async createClinicalNote(data) {
    return this.post("/clinical-notes", data);
  }

  async getLatestVitals(patientId) {
    return this.get(`/clinical-notes/patient/${patientId}/latest-vitals`);
  }

  // ===== ORDER ENDPOINTS =====
  async getOrders(params = {}) {
    const query = this.buildQueryString(params);
    return this.get(`/orders${query ? `?${query}` : ""}`);
  }

  async createOrder(data) {
    return this.post("/orders", data);
  }

  async getPendingOrders(orderType) {
    return this.get(`/orders/pending/${orderType}`);
  }

  async updateOrderStatus(orderId, status, data = {}) {
    return this.put(`/orders/${orderId}/status`, { status, ...data });
  }

  async cancelOrder(orderId) {
    return this.post(`/orders/${orderId}/cancel`, {});
  }

  async getOrderById(orderId) {
    return this.get(`/orders/${orderId}`);
  }

  // ===== RESULT ENDPOINTS =====
  async createResult(data) {
    return this.post("/results", data);
  }

  async getResultsByOrder(orderId) {
    return this.get(`/results/order/${orderId}`);
  }

  async getCriticalResults() {
    return this.get("/results/critical/list");
  }

  // ===== KPI ENDPOINTS =====
  async getDashboard() {
    return this.get("/kpi/dashboard");
  }

  async getDepartmentPerformance() {
    return this.get("/kpi/departments");
  }

  async getPatientTrends(days = 30) {
    return this.get(`/kpi/trends/patients?days=${days}`);
  }

  async getDataQuality() {
    return this.get("/kpi/data-quality");
  }

  // ===== DATA QUALITY ENDPOINTS =====
  async getDataQualityIssues(params = {}) {
    const query = this.buildQueryString(params);
    return this.get(`/data-quality${query ? `?${query}` : ""}`);
  }

  async createDataQualityIssue(data) {
    return this.post("/data-quality", data);
  }

  async resolveIssue(id, resolution) {
    return this.post(`/data-quality/${id}/resolve`, { resolution });
  }

  // ===== DEPARTMENTS =====
  async getDepartments() {
    return this.get("/departments");
  }

  // ===== USERS =====
  async getUsers() {
    return this.get("/users");
  }

  async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  // Add new method
  async getCurrentUserProfile() {
    return this.get("/users/me");
  }

  // Update own profile
  async updateOwnProfile(data) {
    return this.put("/users/me", data);
  }

  // Upload own profile image
  async uploadOwnProfileImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const url = `${this.baseUrl}/users/me/upload-image`;
    const token = this.getToken();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // DON'T set Content-Type - let browser set it with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async createUser(data) {
    return this.post("/users", data);
  }

  async updateUser(id, data) {
    return this.put(`/users/${id}`, data);
  }

  async resetUserPassword(id, data) {
    return this.post(`/users/${id}/reset-password`, data);
  }

  // Deactivate user (soft delete)
  async deactivateUser(userId) {
    return this.post(`/users/${userId}/deactivate`, {});
  }

  // Delete user (hard delete)
  async deleteUser(userId) {
    return this.delete(`/users/${userId}`);
  }

  // Upload user image
  async uploadUserImage(userId, file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${this.baseUrl}/users/${userId}/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          // Don't set Content-Type - browser will set it with boundary
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }
    return data;
  }

  // Add password change method
  async changePassword(data) {
    return this.post("/users/change-password", data);
  }

  // ===== ROLES =====
  async getRoles() {
    return this.get("/roles");
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;
