/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from "axios";

export interface TenantLoginPayload {
  email: string;
  password: string;
}

export interface BankDetailPayload {
  name?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  address?: string;
  holderName?: string;
  bankName?: string;
  bankAccount?: string;
  branchName?: string;
  [key: string]: any;
}

class ApiManager {
  private static axiosInstance: AxiosInstance;
  private static isInitialized = false;

  private static getBaseUrl(): string {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return "http://localhost:4000";
    }

    let subdomain = localStorage.getItem('tenantDomain');

    if (!subdomain) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        subdomain = parts[0];
      } else if (parts.length === 2) {
        subdomain = parts[0];
      }
    }

    return subdomain = `https://${subdomain}.api.rayshreeayurveda.com`;
  }

  static initialize(token?: string | null) {
    this.axiosInstance = axios.create({
      baseURL: this.getBaseUrl(),
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

    // Add request interceptor to add timestamp for cache-busting on GET requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (config.method === 'get') {
          // Add timestamp parameter to prevent browser caching
          config.params = {
            ...config.params,
            _t: Date.now(),
          };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized: Session expired or invalid token");
          const isAdmin =
            localStorage.getItem("isAdmin") === "true" ||
            sessionStorage.getItem("isAdmin") === "true";
          // Clear both storages
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = isAdmin ? "/admin-login" : "/user-login";
        }
        return Promise.reject(error);
      }
    );

    this.isInitialized = true;
  }

  static updateAxiosInstance(instance: AxiosInstance) {
    this.axiosInstance = instance;
  }

  private static checkInitialization() {
    if (!this.isInitialized) {
      // Initialize with stored token if available from either storage
      const storedToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      this.initialize(storedToken);
    }
    return this.axiosInstance;
  }

  private static async request(
    method: "get" | "post" | "patch" | "delete",
    url: string,
    data?: any
  ) {
    const instance = this.checkInitialization();
    if (method === "get") {
      return await instance.get(url);
    }
    return await instance[method](url, data);
  }

  static async createPatient(data: any) {
    const response = await this.request("post", "/patient", data);
    console.log("createPatient response:", response);
    return response.data;
  }

  static async getPatients(
    page: number = 1,
    limit: number = 30,
    search: string = ""
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    }).toString();

    const response = await this.request("get", `/patient?${queryParams}`);
    console.log("getPatients response:", response);
    // Make sure we're returning the entire response, including pagination metadata
    return response;
  }

  static async getPatientById(id: string) {
    const response = await this.request("get", `/patient/${id}`);
    console.log("getPatientById response:", response);
    return response.data;
  }

  static async updatePatient(id: string, data: any) {
    console.log("inside APIM ", "-->", id, "-->", data);
    const response = await this.request("patch", `/patient/${id}`, data);
    console.log("updatePatient response:", response);
    return response.data;
  }

  static async createDepartment(name: string) {
    console.log("inside  create Dept");
    const response = await this.request("post", "/department", { name });
    console.log("createDepartment response:", response);
    return response.data;
  }

  static async getDepartments() {
    const response = await this.request("get", "/department");
    console.log("getDepartments response:", response);
    return response.data;
  }

  static async getDepartmentById(id: string) {
    const response = await this.request("get", `/department/${id}`);
    console.log("getDepartmentById response:", response);
    return response.data;
  }

  static async updateDepartment(id: string, name: string) {
    console.log("inside updateDept");
    const response = await this.request("patch", `/department/${id}`, { name });
    console.log("updateDepartment response:", response);
    return response.data;
  }

  static async deleteDepartment(id: string) {
    const response = await this.request("delete", `/department/${id}`);
    console.log("deleteDepartment response:", response);
    return response.data;
  }

  // USER MANAGEMENT
  static async createUser(data: any) {
    const response = await this.request("post", "/user", data);
    return response.data;
  }

  static async getUsers() {
    const response = await this.request("get", "/user");
    return response.data;
  }

  static async getDoctors() {
    const response = await this.request("get", "/user/doctor");
    return response.data;
  }

  static async getUserById(id: string) {
    const response = await this.request("get", `/user/${id}`);
    return response.data;
  }

  static async updateUser(id: string, data: any) {
    const response = await this.request("patch", `/user/${id}`, data);
    return response.data;
  }

  static async createUserRole(data: any) {
    const response = await this.request("post", "/user-role", data);
    return response.data;
  }

  static async getUserRoles() {
    const response = await this.request("get", "/user-role");
    return response.data;
  }

  static async getUserRoleById(id: string) {
    const response = await this.request("get", `/user-role/${id}`);
    return response.data;
  }

  static async updateUserRole(id: string, data: any) {
    const response = await this.request("patch", `/user-role/${id}`, data);
    return response.data;
  }

  static async adminLogin(data: any) {
    const response = await this.request("post", "/admin/login", data);
    return response.data;
  }

  static async userLogin(data: any) {
    const response = await this.request("post", "/user/login", data);
    return response.data;
  }

  static async tenantLogin(data: TenantLoginPayload) {
    const response = await this.request("post", "/tenant/login", data);
    console.log("tenantLogin response:", response);
    return response.data;
  }

  static async getTenantByDomain(domain: string) {
    const response = await this.request("get", `/tenant/domain/${domain}`);
    console.log("getTenantByDomain response:", response);
    return response.data;
  }

  // General PRESCRIPTION APIs

  static async createGeneralPrescription(data: any) {
    const response = await this.request("post", "/general-prescription", data);
    console.log("createGeneralPrescription response:", response);
    return response.data;
  }

  static async getGeneralPrescriptions() {
    const response = await this.request("get", "/general-prescription");
    console.log("getGeneralPrescriptions response:", response);
    return response.data;
  }

  static async getTodaysGeneralPrescriptions() {
    const response = await this.request("get", "/general-prescription/today");
    console.log("getTodaysGeneralPrescriptions response:", response);
    return response.data;
  }

  static async getPatientAllGeneralPrescriptions(id: string) {
    const response = await this.request(
      "get",
      `/general-prescription?patient=${id}`
    );
    console.log("get a Patient's AllGeneralPrescriptions response:", response);
    return response.data;
  }

  static async getPatientsLatestGeneralPrescriptions(patientId: string) {
    const response = await this.request(
      "get",
      `/general-prescription/last-by-patient/${patientId}`
    );
    console.log("getPatientsLatestGeneralPrescriptions response:", response);
    return response.data;
  }

  static async getPatientsPreviousGeneralPrescriptions(patientId: string) {
    const response = await this.request(
      "get",
      `/general-prescription/previous-by-patient/${patientId}`
    );
    console.log("getPatientsPreviousGeneralPrescriptions response:", response);
    return response.data;
  }

  static async getGeneralPrescriptionsByPatientId(patientId: string) {
    const response = await this.request(
      "get",
      `/general-prescription?patient=${patientId}`
    );
    console.log("getGeneralPrescriptionsByPatientId response:", response);
    return response.data;
  }

  static async getGeneralPrescriptionById(id: string) {
    const response = await this.request("get", `/general-prescription/${id}`);
    console.log("getGeneralPrescriptionById response:", response);
    return response.data;
  }

  static async updateGeneralPrescription(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/general-prescription/${id}`,
      data
    );
    console.log("updateGeneralPrescription response:", response);
    return response.data;
  }

  static async deleteGeneralPrescription(id: string) {
    const response = await this.request(
      "delete",
      `/general-prescription/${id}`
    );
    console.log("deleteGeneralPrescription response:", response);
    return response.data;
  }

  // SPINE PRESCRIPTION APIs

  static async createPrescription(data: any) {
    const response = await this.request("post", "/prescription", data);
    console.log("createPrescription response:", response);
    return response.data;
  }

  static async getPrescriptions() {
    const response = await this.request("get", "/prescription");
    console.log("getPrescriptions response:", response);
    return response.data;
  }

  static async getTodaysPrescriptions() {
    const response = await this.request("get", "/prescription/today");
    console.log("getTodaysPrescriptions response:", response);
    return response.data;
  }
  static async getAllPrescriptions(id: string) {
    const response = await this.request(
      "get",
      "/prescription/today?user=" + id
    );
    console.log("getTodaysPrescriptions response:", response);
    return response.data;
  }

  static async getPrescriptionsByPatientId(patientId: string) {
    const response = await this.request(
      "get",
      `/prescription?patient=${patientId}`
    );
    console.log("getPrescriptionsByPatientId response:", response);
    return response.data;
  }

  static async getPatientsLatestPrescription(id: string) {
    const response = await this.request(
      "get",
      `/prescription/last-by-patient/${id}`
    );
    console.log("getPatientsLatestPrescription response:", response);
    return response.data;
  }

  static async getPreviousSpinePrescription(id: string) {
    const response = await this.request(
      "get",
      `/prescription/previous-by-patient/${id}`
    );
    console.log("getPreviousSpinePrescription response:", response);
    return response.data;
  }

  static async getPrescriptionById(id: string) {
    const response = await this.request("get", `/prescription/${id}`);
    console.log("getPrescriptionById response:", response);
    return response.data;
  }

  static async updatePrescription(id: string, data: any) {
    const response = await this.request("patch", `/prescription/${id}`, data);
    console.log("updatePrescription response:", response);
    return response.data;
  }

  static async deletePrescription(id: string) {
    const instance = this.checkInitialization();
    const response = await instance.delete(`/prescription/${id}`);
    console.log("deletePrescription response:", response);
    return response.data;
  }

  // PILES PRESCRIPTION APIs
  static async createPilesPrescription(data: any) {
    const response = await this.request("post", "/prescription-piles", data);
    console.log("createPrescription response:", response);
    return response.data;
  }

  static async getPilesPrescriptions() {
    const response = await this.request("get", "/prescription-piles");
    console.log("getPrescriptions response:", response);
    return response.data;
    console.log("getPatientsPreviousPrescription response:", response);
    return response.data;
  }

  static async getTodaysPilesPrescriptions() {
    const response = await this.request("get", "/prescription-piles/today");
    console.log("getTodaysPrescriptions response:", response);
    return response.data;
  }
  static async getAllPilesPrescriptions(id: string) {
    const response = await this.request(
      "get",
      "/prescription-piles/today?user=" + id
    );
    console.log("getTodaysPrescriptions response:", response);
    return response.data;
  }

  static async getPilesPrescriptionsByPatientId(patientId: string) {
    const response = await this.request(
      "get",
      `/prescription-piles?patient=${patientId}`
    );
    console.log("getPrescriptionsByPatientId response:", response);
    return response.data;
  }

  static async getPilesPatientsLatestPrescription(id: string) {
    const response = await this.request(
      "get",
      `/prescription-piles/last-by-patient/${id}`
    );
    console.log("getPatientsLatestPrescription response:", response);
    return response.data;
  }

  static async getPilesPrescriptionById(id: string) {
    const response = await this.request("get", `/prescription-piles/${id}`);
    console.log("getPrescriptionById response:", response);
    return response.data;
  }

  static async getPreviousPilesPrescription(id: string) {
    const response = await this.request(
      "get",
      `/prescription-piles/previous-by-patient/${id}`
    );
    console.log("getPreviousPilesPrescription response:", response);
    return response.data;
  }

  static async getPreviousGeneralPrescription(id: string) {
    const response = await this.request(
      "get",
      `/general-prescription/previous-by-patient/${id}`
    );
    console.log("getPreviousGeneralPrescription response:", response);
    return response.data;
  }

  static async updatePilesPrescription(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/prescription-piles/${id}`,
      data
    );
    console.log("updatePrescription response:", response);
    return response.data;
  }

  static async deletePilesPrescription(id: string) {
    const instance = this.checkInitialization();
    const response = await instance.delete(`/prescription-piles/${id}`);
    console.log("deletePrescription response:", response);
    return response.data;
  }

  static async createTest(data: any) {
    const response = await this.request("post", "/medical-test", data);
    console.log("createTest response:", response);
    return response.data;
  }

  static async getTests() {
    const response = await this.request("get", "/medical-test");
    console.log("getTests response:", response);
    return response.data;
  }

  static async createTestCategory(name: string) {
    const response = await this.request("post", "/medical-test-category", {
      name,
    });
    console.log("createTestCategory response:", response);
    return response.data;
  }

  static async deleteTest(id: string) {
    const response = await this.request("delete", `/medical-test/${id}`);
    console.log("deleteTest response:", response);
    return response.data;
  }

  static async editTest(id: string, data: any) {
    const response = await this.request("patch", `/medical-test/${id}`, data);
    return response.data;
  }

  static async getTestCategories() {
    const response = await this.request("get", "/medical-test-category");
    console.log("getTestCategories response:", response);
    return response.data;
  }

  static async deleteCategory(id: string) {
    const response = await this.request(
      "delete",
      `/medical-test-category/${id}`
    );
    console.log("deleteCategory response:", response);
    return response.data;
  }

  // DIAGNOSIS CENTER'S APIs

  static async createDiagnosticCenter(data: any) {
    const response = await this.request("post", "/diagnosis-center", data);
    console.log("createDiagnosticCenter response:", response);
    return response.data;
  }

  static async getDiagnosticCenters() {
    const response = await this.request("get", "/diagnosis-center");
    console.log("getDiagnosticCenters response:", response);
    return response.data;
  }

  static async getDiagnosticCenterById(id: string) {
    const response = await this.request("get", `/diagnosis-center/${id}`);
    console.log("getDiagnosticCenterById response:", response);
    return response.data;
  }

  static async updateDiagnosticCenter(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/diagnosis-center/${id}`,
      data
    );
    console.log("updateDiagnosticCenter response:", response);
    return response.data;
  }

  static async deleteDiagnosticCenter(id: string) {
    const instance = this.checkInitialization();
    const response = await instance.delete(`/diagnosis-center/${id}`);
    console.log("deleteDiagnosticCenter response:", response);
    return response.data;
  }

  // RX GROUP APIs
  static async createRxGroup(data: any) {
    const response = await this.request("post", "/rx-group", data);
    console.log("createRxGroup response:", response);
    return response.data;
  }

  static async getRxGroups() {
    const response = await this.request("get", "/rx-group");
    console.log("getRxGroups response:", response);
    return response.data;
  }

  static async getRxGroupById(id: string) {
    const response = await this.request("get", `/rx-group/${id}`);
    console.log("getRxGroupById response:", response);
    return response.data;
  }

  static async updateRxGroup(id: string, data: any) {
    const response = await this.request("patch", `/rx-group/${id}`, data);
    console.log("updateRxGroup response:", response);
    return response.data;
  }

  static async deleteRxGroup(id: string) {
    const instance = this.checkInitialization();
    const response = await instance.delete(`/rx-group/${id}`);
    console.log("deleteRxGroup response:", response);
    return response.data;
  }

  static async createMedicine(data: any) {
    const response = await this.request("post", "/medicine", data);
    console.log("createMedicine response:", response);
    return response.data;
  }

  static async getMedicines() {
    const response = await this.request("get", "/medicine");
    console.log("getMedicines response:", response);
    return response.data;
  }

  static async getStock() {
    const response = await this.request("get", "/stock");
    console.log("getStock response:", response);
    return response.data;
  }

  static async updateMedicine(id: string, data: any) {
    const response = await this.request("patch", `/medicine/${id}`, data);
    console.log("updateMedicine response:", response);
    return response.data;
  }

  static async deleteMedicine(id: string) {
    const instance = this.checkInitialization();
    const response = await instance.delete(`/medicine/${id}`);
    console.log("deleteMedicine response:", response);
    return response.data;
  }

  // WHEN HOW APIs
  static async getWhenHow() {
    const response = await this.request("get", "/when-how");
    console.log("getWhenHow response:", response);
    return response.data;
  }

  static async getPrescribedTests(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    let url = "/prescription/test";
    if (params && (params.startDate || params.endDate)) {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      url += `?${queryParams.toString()}`;
    }
    const response = await this.request("get", url);
    return response.data;
  }

  static async createWhenHow(data: any) {
    const response = await this.request("post", "/when-how", data);
    console.log("createWhenHow response:", response);
    return response.data;
  }

  static async updateWhenHow(id: string, data: any) {
    const response = await this.request("patch", `/when-how/${id}`, data);
    console.log("updateWhenHow response:", response);
    return response.data;
  }

  static async deleteWhenHow(id: string) {
    const response = await this.request("delete", `/when-how/${id}`);
    console.log("deleteWhenHow response:", response);
    return response.data;
  }

  // THERAPY APIs
  static async createTherapy(data: any) {
    const response = await this.request("post", "/therapy", data);
    console.log("createTherapy response:", response);
    return response.data;
  }

  static async getTherapies() {
    const response = await this.request("get", "/therapy");
    console.log("getTherapies response:", response);
    return response.data;
  }

  static async updateTherapy(id: string, data: any) {
    const response = await this.request("patch", `/therapy/${id}`, data);
    console.log("updateTherapy response:", response);
    return response.data;
  }

  static async deleteTherapy(id: string) {
    const response = await this.request("delete", `/therapy/${id}`);
    console.log("deleteTherapy response:", response);
    return response.data;
  }

  // OILS APIs
  static async createOil(data: any) {
    const response = await this.request("post", "/oils", data);
    console.log("createOil response:", response);
    return response.data;
  }

  static async getOils() {
    const response = await this.request("get", "/oils");
    console.log("getOils response:", response);
    return response.data;
  }

  static async updateOil(id: string, data: any) {
    const response = await this.request("patch", `/oils/${id}`, data);
    console.log("updateOil response:", response);
    return response.data;
  }

  static async deleteOil(id: string) {
    const response = await this.request("delete", `/oils/${id}`);
    console.log("deleteOil response:", response);
    return response.data;
  }

  // PANCHAKARMA GROUP APIs
  static async createPanchakarmaGroup(data: any) {
    const response = await this.request("post", "/panchakarma-group", data);
    console.log("createPanchakarmaGroup response:", response);
    return response.data;
  }

  static async getPanchakarmaGroups() {
    const response = await this.request("get", "/panchakarma-group");
    console.log("getPanchakarmaGroups response:", response);
    return response.data;
  }

  static async getPanchakarmaGroupById(id: string) {
    const response = await this.request("get", `/panchakarma-group/${id}`);
    console.log("getPanchakarmaGroupById response:", response);
    return response.data;
  }

  static async updatePanchakarmaGroup(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/panchakarma-group/${id}`,
      data
    );
    console.log("updatePanchakarmaGroup response:", response);
    return response.data;
  }

  static async deletePanchakarmaGroup(id: string) {
    const response = await this.request("delete", `/panchakarma-group/${id}`);
    console.log("deletePanchakarmaGroup response:", response);
    return response.data;
  }

  static async getComplaints() {
    const response = await this.request("get", "/complaint");
    console.log("getComplaints response:", response);
    return response.data;
  }
  static async getGeneralExamination() {
    const response = await this.request("get", "/general-examination");
    console.log("getGeneralExamination response:", response);
    return response.data;
  }

  static async getDiagnosis() {
    const response = await this.request("get", "/diagnostic-group");
    console.log("getDiagnosis response:", response);
    return response.data;
  }

  // COMPLAINTS
  static async createComplaint(data: any) {
    const response = await this.request("post", "/complaint", data);
    console.log("createComplaint response:", response);
    return response.data;
  }

  static async deleteComplaint(id: string) {
    const response = await this.request("delete", `/complaint/${id}`);
    console.log("deleteComplaint response:", response);
    return response.data;
  }

  // GENERAL EXAMINATION
  static async createGeneralExamination(data: any) {
    const response = await this.request("post", "/general-examination", data);
    console.log("createGeneralExamination response:", response);
    return response.data;
  }

  static async deleteGeneralExamination(id: string) {
    const response = await this.request("delete", `/general-examination/${id}`);
    console.log("deleteGeneralExamination response:", response);
    return response.data;
  }

  // DIAGNOSIS
  static async createDiagnosis(data: any) {
    const response = await this.request("post", "/diagnostic", data);
    console.log("createDiagnosis response:", response);
    return response.data;
  }

  static async deleteDiagnosis(id: string) {
    const response = await this.request("delete", `/diagnostic/${id}`);
    console.log("deleteDiagnosis response:", response);
    return response.data;
  }

  // Upload to s3
  static async uploadToS3(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const instance = this.checkInitialization();
      const response = await instance.post("/aws", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("File uploaded successfully to S3:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  }

  static async getS3Url(fileName: string): Promise<{
    status: boolean;
    message: string;
    metaData: {
      signedUrl: string;
    };
  }> {
    try {
      const instance = this.checkInitialization();
      const response = await instance.get(`/aws/${fileName}`);
      console.log("S3 URL retrieved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error retrieving S3 URL:", error);
      throw error;
    }
  }

  static async deleteS3File(fileName: string): Promise<any> {
    try {
      const instance = this.checkInitialization();
      const response = await instance.delete(`/aws/${fileName}`);
      console.log("S3 file deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting S3 file:", error);
      throw error;
    }
  }
  static async createCarePlan(data: any) {
    const response = await this.request("post", "/care-plan", data);
    return response.data;
  }

  static async getCarePlan() {
    const response = await this.request("get", "/care-plan");
    return response.data;
  }

  static async updateCarePlan(id: string, data: any) {
    const response = await this.request("patch", `/care-plan/${id}`, data);
    return response.data;
  }

  static async getCarePlanByPres(id: string) {
    const response = await this.request("get", `/care-plan/${id}`);
    return response.data;
  }

  static async createCarePlanGroup(data: { name: string; type: string }) {
    const response = await this.request("post", "/care-plan-group", data);
    return response.data;
  }

  static async getCarePlanGroups(type?: string) {
    const query = type ? `?type=${type}` : "";
    const response = await this.request("get", `/care-plan-group${query}`);
    return response.data;
  }

  static async deleteCarePlanGroup(id: string) {
    const response = await this.request("delete", `/care-plan-group/${id}`);
    return response.data;
  }

  static async addInternalNote(data: { name: string; type: string }) {
    const response = await this.request("post", "/care-plan-group", data);
    return response.data;
  }

  // beds
  static async getBed() {
    const response = await this.request("get", `/bed`);
    return response.data;
  }

  static async createBed(data: any) {
    const response = await this.request("post", "/bed", data);
    return response.data;
  }

  static async getBedById(id: string) {
    const response = await this.request("get", `/bed/${id}`);
    return response.data;
  }

  static async patchBed(_id: string, data: any) {
    const response = await this.request("patch", `/bed/${_id}`, data);
    return response.data;
  }

  static async searchPrescriptions(page: number = 1, search: string = "") {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...(search && { search }),
    }).toString();
    const response = await this.request(
      "get",
      `/prescription/search?${queryParams}`
    );
    return response.data;
  }

  static async searchPilesPrescriptions(
    page: number = 1,
    limit: number = 30,
    internalNote: string = ""
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(internalNote && { internalNote }),
    }).toString();
    const response = await this.request(
      "get",
      `/prescription-piles/search?${queryParams}`
    );
    return response.data;
  }

  static async searchPrescriptionsWithParams(queryParams: URLSearchParams) {
    try {
      const response = await this.request(
        "get",
        `/prescription/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching prescriptions:", error);
      throw error;
    }
  }

  static async searchPilesPrescriptionsWithParams(
    queryParams: URLSearchParams
  ) {
    try {
      const response = await this.request(
        "get",
        `/prescription-piles/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching piles prescriptions:", error);
      throw error;
    }
  }

  static async getPurchaseMedicine() {
    const response = await this.request("get", `/purchase`);
    return response.data;
  }

  static async createPurchaseMedicine(data: any) {
    const response = await this.request("post", "/purchase", data);
    return response.data;
  }

  static async getPurchaseMedicineById(id: string) {
    const response = await this.request("get", `/purchase/${id}`);
    return response.data;
  }

  static async patchPurchaseMedicine(_id: string, data: any) {
    const response = await this.request("patch", `/purchase/${_id}`, data);
    return response.data;
  }

  static async deletePurchaseMedicine(id: string) {
    const response = await this.request("delete", `/purchase/${id}`);
    console.log("deletePurchaseMedicine response:", response);
    return response.data;
  }

  static async getSaleMedicine() {
    const response = await this.request("get", `/sale`);
    return response.data;
  }

  static async createSaleMedicine(data: any) {
    const response = await this.request("post", "/sale", data);
    return response.data;
  }

  static async getSaleMedicineById(id: string) {
    const response = await this.request("get", `/sale/${id}`);
    return response.data;
  }

  static async patchSaleMedicine(_id: string, data: any) {
    const response = await this.request("patch", `/sale/${_id}`, data);
    return response.data;
  }

  static async deleteSaleMedicine(_id: string) {
    const response = await this.request("delete", `/sale/${_id}`);
    return response.data;
  }

  static async waveOffSale(saleId: string) {
    const response = await this.request("post", `/sale/wave-off/${saleId}`, {});
    return response.data;
  }

  static async getStockMedicine() {
    const response = await this.request("get", `/stock`);
    return response.data;
  }

  static async searchSpinePrescriptions(
    page: number = 1,
    limit: number = 30,
    internalNote: string = ""
  ) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(internalNote && { internalNote }),
    }).toString();
    const response = await this.request(
      "get",
      `/prescription/search?${queryParams}`
    );
    return response.data;
  }

  static async getBedsByPatientId(patientId: string) {
    const response = await this.request("get", `/bed?patientId=${patientId}`);
    return response.data;
  }

  static async assignBed(payload: { bed: string; patient: string }) {
    const response = await this.request("post", "/bed-occupancy", payload);
    return response.data;
  }

  static async getOccupiedBeds() {
    const response = await this.request("get", "/bed-occupancy/occupied");
    return response.data;
  }

  static async releaseBedOccupancy(id: string) {
    const response = await this.request(
      "patch",
      `/bed-occupancy/release/${id}`
    );
    return response;
  }

  // UNIT APIs
  static async getUnits() {
    const response = await this.request("get", "/unit");
    console.log("getUnits response:", response);
    return response.data;
  }

  static async createUnit(data: any) {
    const response = await this.request("post", "/unit", data);
    return response.data;
  }

  static async patchUnit(id: string, data: any) {
    const response = await this.request("patch", `/unit/${id}`, data);
    return response.data;
  }

  static async deleteUnit(id: string) {
    const response = await this.request("delete", `/unit/${id}`);
    return response.data;
  }

  // MANUFACTURER APIs
  static async getManufacturer() {
    const response = await this.request("get", "/medicine-manufacturer");
    console.log("getManufacturer response:", response);
    return response.data;
  }

  static async createManufacturer(data: any) {
    const response = await this.request("post", "/medicine-manufacturer", data);
    return response.data;
  }

  static async patchManufacturer(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/medicine-manufacturer/${id}`,
      data
    );
    return response.data;
  }

  static async deleteManufacturer(id: string) {
    const response = await this.request(
      "delete",
      `/medicine-manufacturer/${id}`
    );
    return response.data;
  }

  static async getMedicinesWithManufacturer() {
    const response = await this.request("get", "/medicine/with-manufacturer");
    console.log("getMedicines with manufacturer response:", response);
    return response.data;
  }

  // DISTRIBUTOR APIs
  static async getDistributor() {
    const response = await this.request("get", "/distributor");
    console.log("getDistributor response:", response);
    return response.data;
  }

  static async createDistributor(data: any) {
    const response = await this.request("post", "/distributor", data);
    return response.data;
  }

  static async patchDistributor(id: string, data: any) {
    const response = await this.request("patch", `/distributor/${id}`, data);
    return response.data;
  }

  static async deleteDistributor(id: string) {
    const response = await this.request("delete", `/distributor/${id}`);
    return response.data;
  }

  static async getBedOccupancies() {
    const response = await this.request("get", "/bed-occupancy");
    // Return the array of occupancies directly
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  static async searchSpinePrescriptionsWithParams(
    queryParams: URLSearchParams
  ) {
    try {
      const response = await this.request(
        "get",
        `/prescription/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching spine prescriptions:", error);
      throw error;
    }
  }

  // Bank Details APIs
  static async getBankDetails() {
    const response = await this.request("get", `/bank`);
    return response.data;
  }

  static async addBankDetail(data: BankDetailPayload) {
    const response = await this.request("post", "/bank", data);
    return response.data;
  }

  static async deleteBankDetail(id: string) {
    const response = await this.request("delete", `/bank/${id}`);
    return response.data;
  }

  static async updateBankDetail(id: string, data: BankDetailPayload) {
    const response = await this.request("patch", `/bank/${id}`, data);
    return response.data;
  }

  static async getMedicineWithStock() {
    const response = await this.request("get", `/medicine/with-stock`);
    return response.data;
  }

  // PANCHAKARMA PURCHASE APIs
  static async createPanchakarmaPurchase(data: any) {
    const response = await this.request("post", `/panchakarma-purchase`, data);
    return response.data;
  }

  static async getPanchakarmaPurchases() {
    const response = await this.request("get", `/panchakarma-purchase`);
    return response.data;
  }

  static async patchPanchakarmaPurchase(id: string, data: any) {
    const response = await this.request("patch", `/panchakarma-purchase/${id}`, data);
    return response.data;
  }

  // PANCHAKARMA STOCK APIs
  static async getPanchakarmaStock() {
    const response = await this.request("get", `/panchakarma-stock`);
    return response.data;
  }

  static async patchPanchakarmaStock(id: string, data: any) {
    const response = await this.request("patch", `/panchakarma-stock/${id}`, data);
    return response.data;
  }

  // PANCHAKARMA STOCK ADJUSTMENT APIs
  static async createPanchakarmaStockAdjustment(data: any) {
    const response = await this.request("post", `/panchakarma-adjust-stock`, data);
    return response.data;
  }

  static async getPanchakarmaStockAdjustments() {
    const response = await this.request("get", `/panchakarma-adjust-stock`);
    return response.data;
  }

  static async createPanchakarmaOpeningStock(data: any) {
    const response = await this.request("post", `/panchakarma-adjust-stock/opening-stock`, data);
    return response.data;
  }

  // MEDICINE ROOM (register) APIs
  static async createMedicineRoomEntry(data: any) {
    const response = await this.request("post", `/medicine-room`, data);
    return response.data;
  }

  static async getMedicineRoomEntries() {
    const response = await this.request("get", `/medicine-room`);
    return response.data;
  }

  static async getMedicineRoomByPatient(patientId: string) {
    const response = await this.request("get", `/medicine-room/by-patient/${patientId}`);
    return response.data;
  }

  static async getMedicineRoomByPatientUnbilled(patientId: string) {
    const response = await this.request(
      "get",
      `/medicine-room/by-patient/${patientId}/unbilled`
    );
    return response.data;
  }

  static async getMedicineRoomCurrentMonth() {
    const response = await this.request("get", `/medicine-room/current-month`);
    return response.data;
  }

  static async getMedicineRoomCurrentMonthByDate(dateIso: string) {
    // The backend expects the raw ISO string as the date query parameter (do not double-encode)
    const response = await this.request("get", `/medicine-room/current-month?date=${dateIso}`);
    return response.data;
  }

  static async getMedicineRoomByMonth(year: number, month: number) {
    const response = await this.request("get", `/medicine-room?month=${month}&year=${year}`);
    return response.data;
  }

  static async getMedicineRoomByQuery(queryObj: any) {
    const q = encodeURIComponent(JSON.stringify(queryObj));
    const response = await this.request("get", `/medicine-room?query=${q}`);
    return response.data;
  }

  static async getMedicineRoomById(id: string) {
    const response = await this.request("get", `/medicine-room/${id}`);
    return response.data;
  }

  static async patchMedicineRoom(id: string, data: any) {
    const response = await this.request("patch", `/medicine-room/${id}`, data);
    return response.data;
  }

  static async deleteMedicineRoom(id: string) {
    const response = await this.request("delete", `/medicine-room/${id}`);
    return response.data;
  }

  // PANCHAKARMA SALE (billing) APIs
  static async getPanchakarmaSales() {
    const response = await this.request("get", `/panchakarma-sale`);
    return response.data;
  }

  static async createPanchakarmaSale(data: any) {
    const response = await this.request("post", `/panchakarma-sale`, data);
    return response.data;
  }

  static async getPanchakarmaSaleById(id: string) {
    const response = await this.request("get", `/panchakarma-sale/${id}`);
    return response.data;
  }

  static async patchPanchakarmaSale(id: string, data: any) {
    const response = await this.request("patch", `/panchakarma-sale/${id}`, data);
    return response.data;
  }

  static async deletePanchakarmaSale(id: string) {
    const response = await this.request("delete", `/panchakarma-sale/${id}`);
    return response.data;
  }

  // Stock Adjustment APIs

  static async getStockAdjustments() {
    const response = await this.request("get", `/adjust-stock`);
    return response.data;
  }

  static async adjustStock(data: {
    medicine: string;
    batchNumber: string;
    adjustmentDate: string;
    totalQuantity: number;
    adjustType: string;
    reason: string;
  }) {
    const response = await this.request("post", "/adjust-stock", data);
    return response.data;
  }

  static async openStock(data: {
    medicine: string;
    batchNumber: string;
    adjustmentDate: string;
    totalQuantity: number;
    sellingPrice: number;
    manufacturingDate: string;
    unitType: string;
    expiryDate: string;
  }) {
    const response = await this.request(
      "post",
      "/adjust-stock/opening-stock",
      data
    );
    return response.data;
  }

  static async patchStock(_id: string, data: {
    medicine: string;
    totalQuantity: number;
    unitType: string;
    expiryDate: string;
    batchNumber: string;
    sellingPrice: number;
    manufacturingDate: string;
  }) {
    const response = await this.request("patch", `/stock/${_id}`, data);
    return response.data;
  }

  // TRACKING REPORT APIs
  static async getTrackingReports() {
    const response = await this.request("get", "/tracking-report");
    return response.data;
  }

  static async createTrackingReport(data: any) {
    const response = await this.request("post", "/tracking-report", data);
    return response.data;
  }

  static async updateTrackingReport(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/tracking-report/${id}`,
      data
    );
    return response.data;
  }

  static async deleteTrackingReport(id: string) {
    const response = await this.request("delete", `/tracking-report/${id}`);
    return response.data;
  }

  static async getBedOccupancyReport(date: string) {
    const response = await this.request(
      "get",
      `/bed-occupancy/report?date=${date}`
    );
    return response.data;
  }

  // PATIENTS THERAPY APIs

  static async createPatientTherapy(data: any) {
    const response = await this.request("post", "/patient-therapy", data);
    return response.data;
  }
  static async getPatientTherapies() {
    const response = await this.request("get", `/patient-therapy`);
    return response.data;
  }

  static async getPatientTherapyById(id: string) {
    const response = await this.request("get", `/patient-therapy/${id}`);
    return response.data;
  }

  static async updatePatientTherapy(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/patient-therapy/${id}`,
      data
    );
    return response.data;
  }

  static async deletePatientTherapy(id: string) {
    const response = await this.request("delete", `/patient-therapy/${id}`);
    return response.data;
  }

  // THERAPY SESSION APIs
  static async getTherapySessions() {
    const response = await this.request("get", "/therapy-sessions");
    return response.data;
  }

  static async getTherapySessionByTherapyId(id: string) {
    const response = await this.request(
      "get",
      `/therapy-sessions/by-therapy/${id}`
    );
    return response.data;
  }

  static async createTherapySession(data: any) {
    const response = await this.request("post", "/therapy-sessions", data);
    return response.data;
  }

  static async updateTherapySession(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/therapy-sessions/${id}`,
      data
    );
    return response.data;
  }

  static async deleteTherapySession(id: string) {
    const response = await this.request("delete", `/therapy-sessions/${id}`);
    return response.data;
  }

  // UTENSIL APIs
  static async getUtensils(type?: string) {
    const query = type ? `?type=${type}` : "";
    const response = await this.request("get", `/utensil-item${query}`);
    return response.data;
  }

  static async createUtensil(data: { name: string; utensilType: string }) {
    const response = await this.request("post", "/utensil-item", data);
    return response.data;
  }

  static async updateUtensil(
    id: string,
    data: { name: string; utensilType: string }
  ) {
    const response = await this.request("patch", `/utensil-item/${id}`, data);
    return response.data;
  }

  static async deleteUtensil(id: string) {
    const response = await this.request("delete", `/utensil-item/${id}`);
    return response.data;
  }

  // PANCHAKARMA INVENTORY APIs
  static async getPanchkarmaInventory() {
    const response = await this.request("get", "/panchkarma-inventory");
    return response.data;
  }

  static async getCurrentMonthPanchkarmaInventory() {
    const response = await this.request(
      "get",
      `/panchkarma-inventory/current-month`
    );
    console.log("Current Month Panchkarma Inventory:", response.data);
    return response.data;
  }

  static async createPanchkarmaInventory(data: {
    items: {
      utensilItem: string;
      quantity?: number;
      responsibilty?: string;
      checkedBy?: string;
    }[];
    responsibleUser?: string;
    checkedUser?: string;
  }) {
    const response = await this.request("post", "/panchkarma-inventory", data);
    return response.data;
  }

  static async updatePanchkarmaInventory(
    id: string,
    data: {
      items: {
        utensilItem: string;
        quantity?: number;
        responsibilty?: string;
        checkedBy?: string;
      }[];
      responsibleUser?: string;
      checkedUser?: string;
    }
  ) {
    const response = await this.request(
      "patch",
      `/panchkarma-inventory/${id}`,
      data
    );
    return response.data;
  }

  static async deletePanchkarmaInventory(id: string) {
    const response = await this.request(
      "delete",
      `/panchkarma-inventory/${id}`
    );
    return response.data;
  }

  // MEDICINE PREPARATION INVENTORY APIs
  static async getMedicinePreparationInventory() {
    const response = await this.request("get", "/medicine-preparation-room");
    return response.data;
  }

  static async getCurrentMonthMedicinePreparationInventory() {
    const response = await this.request(
      "get",
      `/medicine-preparation-room/current-month`
    );
    return response.data;
  }

  static async createMedicinePreparationInventory(data: {
    items: {
      utensilItem: string;
      quantity?: number;
      responsibilty?: string;
      checkedBy?: string;
    }[];
    responsibleUser?: string;
    checkedUser?: string;
  }) {
    const response = await this.request(
      "post",
      "/medicine-preparation-room",
      data
    );
    return response.data;
  }

  static async updateMedicinePreparationInventory(
    id: string,
    data: {
      items: {
        utensilItem: string;
        quantity?: number;
        responsibilty?: string;
        checkedBy?: string;
      }[];
      responsibleUser?: string;
      checkedUser?: string;
    }
  ) {
    const response = await this.request(
      "patch",
      `/medicine-preparation-room/${id}`,
      data
    );
    return response.data;
  }

  static async deleteMedicinePreparationInventory(id: string) {
    const response = await this.request(
      "delete",
      `/medicine-preparation-room/${id}`
    );
    return response.data;
  }

  // THERAPY DOCS APIs

  // DAILY MEDICATION APIs
  static async getDailyMedications() {
    const response = await this.request("get", "/daily-medication");
    return response.data;
  }

  static async getDailyMedicationsByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/daily-medication/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getDailyMedicationById(id: string) {
    const response = await this.request("get", `/daily-medication/${id}`);
    return response.data;
  }

  static async createDailyMedication(data: any) {
    const response = await this.request("post", "/daily-medication", data);
    return response.data;
  }

  static async updateDailyMedication(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/daily-medication/${id}`,
      data
    );
    return response.data;
  }

  static async deleteDailyMedication(id: string) {
    const response = await this.request("delete", `/daily-medication/${id}`);
    return response.data;
  }

  // DAILY VITAL FEEDBACK APIs
  static async getDailyVitalFeedbacks() {
    const response = await this.request("get", "/daily-vital-feedback");
    return response.data;
  }

  static async getDailyVitalFeedbacksByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/daily-vital-feedback/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getDailyVitalFeedbackById(id: string) {
    const response = await this.request("get", `/daily-vital-feedback/${id}`);
    return response.data;
  }

  static async createDailyVitalFeedback(data: any) {
    const response = await this.request("post", "/daily-vital-feedback", data);
    return response.data;
  }

  static async updateDailyVitalFeedback(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/daily-vital-feedback/${id}`,
      data
    );
    return response.data;
  }

  static async deleteDailyVitalFeedback(id: string) {
    const response = await this.request(
      "delete",
      `/daily-vital-feedback/${id}`
    );
    return response.data;
  }

  // DAILY DIET ASSESSMENT APIs
  static async getDailyDietAssessments() {
    const response = await this.request("get", "/daily-diet-assessment");
    return response.data;
  }

  static async getDailyDietAssessmentsByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/daily-diet-assessment/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getDailyDietAssessmentById(id: string) {
    const response = await this.request("get", `/daily-diet-assessment/${id}`);
    return response.data;
  }

  static async createDailyDietAssessment(data: any) {
    const response = await this.request("post", "/daily-diet-assessment", data);
    return response.data;
  }

  static async updateDailyDietAssessment(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/daily-diet-assessment/${id}`,
      data
    );
    return response.data;
  }

  static async deleteDailyDietAssessment(id: string) {
    const response = await this.request(
      "delete",
      `/daily-diet-assessment/${id}`
    );
    return response.data;
  }

  // NURSE OBSERVATION APIs
  static async getNurseObservations() {
    const response = await this.request("get", "/nurse-observation");
    return response.data;
  }

  static async getNurseObservationsByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/nurse-observation/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getNurseObservationById(id: string) {
    const response = await this.request("get", `/nurse-observation/${id}`);
    return response.data;
  }

  static async createNurseObservation(data: any) {
    const response = await this.request("post", "/nurse-observation", data);
    return response.data;
  }

  static async updateNurseObservation(id: string, data: any) {
    const response = await this.request(
      "patch",
      `/nurse-observation/${id}`,
      data
    );
    return response.data;
  }

  static async deleteNurseObservation(id: string) {
    const response = await this.request("delete", `/nurse-observation/${id}`);
    return response.data;
  }

  // PAIN SCORING APIs
  static async getPainScorings() {
    const response = await this.request("get", "/pain-scoring");
    return response.data;
  }

  static async getPainScoringsByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/pain-scoring/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getPainScoringById(id: string) {
    const response = await this.request("get", `/pain-scoring/${id}`);
    return response.data;
  }

  static async createPainScoring(data: any) {
    const response = await this.request("post", "/pain-scoring", data);
    return response.data;
  }

  static async updatePainScoring(id: string, data: any) {
    const response = await this.request("patch", `/pain-scoring/${id}`, data);
    return response.data;
  }

  static async deletePainScoring(id: string) {
    const response = await this.request("delete", `/pain-scoring/${id}`);
    return response.data;
  }

  // PROCEDURE CARE APIs
  static async getProcedureCares() {
    const response = await this.request("get", "/procedure-care");
    return response.data;
  }

  static async getProcedureCaresByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/procedure-care/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getProcedureCareById(id: string) {
    const response = await this.request("get", `/procedure-care/${id}`);
    return response.data;
  }

  static async createProcedureCare(data: any) {
    const response = await this.request("post", "/procedure-care", data);
    return response.data;
  }

  static async updateProcedureCare(id: string, data: any) {
    const response = await this.request("patch", `/procedure-care/${id}`, data);
    return response.data;
  }

  static async deleteProcedureCare(id: string) {
    const response = await this.request("delete", `/procedure-care/${id}`);
    return response.data;
  }

  // PROGRESS NOTE APIs
  static async getProgressNotes() {
    const response = await this.request("get", "/progress-note");
    return response.data;
  }

  static async getProgressNotesByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/progress-note/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getProgressNoteById(id: string) {
    const response = await this.request("get", `/progress-note/${id}`);
    return response.data;
  }

  static async createProgressNote(data: any) {
    const response = await this.request("post", "/progress-note", data);
    return response.data;
  }

  static async updateProgressNote(id: string, data: any) {
    const response = await this.request("patch", `/progress-note/${id}`, data);
    return response.data;
  }

  static async deleteProgressNote(id: string) {
    const response = await this.request("delete", `/progress-note/${id}`);
    return response.data;
  }

  // THERAPIST NOTE APIs
  static async getTherapistNotes() {
    const response = await this.request("get", "/therapist-note");
    return response.data;
  }

  static async getTherapistNotesByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/therapist-note/by-therapy/${therapyId}`
    );
    return response.data;
  }

  static async getTherapistNoteById(id: string) {
    const response = await this.request("get", `/therapist-note/${id}`);
    return response.data;
  }

  static async createTherapistNote(data: any) {
    const response = await this.request("post", "/therapist-note", data);
    return response.data;
  }

  static async updateTherapistNote(id: string, data: any) {
    const response = await this.request("patch", `/therapist-note/${id}`, data);
    return response.data;
  }

  static async deleteTherapistNote(id: string) {
    const response = await this.request("delete", `/therapist-note/${id}`);
    return response.data;
  }

  // /vital-chart APIs
  static async getVitalCharts() {
    const response = await this.request("get", "/vital-chart");
    return response.data;
  }
  static async createVitalChart(data: any) {
    const response = await this.request("post", "/daily-vital-feedback", data);
    return response.data;
  }
  static async updateVitalChart(id: string, data: any) {
    const response = await this.request("patch", `/daily-vital-feedback/${id}`, data);
    return response.data;
  }
  static async deleteVitalChart(id: string) {
    const response = await this.request("delete", `/vital-chart/${id}`);
    return response.data;
  }

  static async getVitalChartsByTherapyId(therapyId: string) {
    const response = await this.request(
      "get",
      `/daily-vital-feedback/by-therapy/${therapyId}`
    );
    return response.data;
  }

  // APP INFO APIs
  static async getAppInfo(tenantId: string) {
    const response = await this.request("get", `/app-info/${tenantId}`);
    console.log("getAppInfo response:", response);

    // If we have image keys, fetch their signed URLs
    if (response.data?.data) {
      const appInfo = response.data.data;
      const imageKeys = {
        logo: appInfo.logo,
        prescriptionHeader: appInfo.prescriptionHeader,
        prescriptionBackground: appInfo.prescriptionBackground,
        prescriptionFooter: appInfo.prescriptionFooter,
      };

      // Fetch signed URLs for all image keys in parallel
      const urlPromises = Object.entries(imageKeys).map(async ([key, value]) => {
        if (value) {
          try {
            const urlResponse = await this.getS3Url(value);
            return { key, signedUrl: urlResponse.metaData?.signedUrl, s3Key: value };
          } catch (error) {
            console.error(`Error fetching signed URL for ${key}:`, error);
            return { key, signedUrl: null, s3Key: value };
          }
        }
        return { key, signedUrl: null, s3Key: null };
      });

      const urls = await Promise.all(urlPromises);

      // Add signed URLs to the response data
      response.data.data.imageUrls = urls.reduce((acc, { key, signedUrl, s3Key }) => {
        acc[key] = signedUrl;
        acc[`${key}Key`] = s3Key;
        return acc;
      }, {} as Record<string, string | null>);
    }

    return response.data;
  }

  static async getAppInfoByTenant(tenantId: string) {
    const response = await this.request("get", `/app-info/tenant/${tenantId}`);
    console.log("getAppInfoByTenant response:", response);

    // If we have image keys, fetch their signed URLs
    if (response.data?.data) {
      const appInfo = response.data.data;
      const imageKeys = {
        logo: appInfo.logo,
        prescriptionHeader: appInfo.prescriptionHeader,
        prescriptionBackground: appInfo.prescriptionBackground,
        prescriptionFooter: appInfo.prescriptionFooter,
      };

      // Fetch signed URLs for all image keys in parallel
      const urlPromises = Object.entries(imageKeys).map(async ([key, value]) => {
        if (value) {
          try {
            const urlResponse = await this.getS3Url(value);
            return { key, signedUrl: urlResponse.metaData?.signedUrl, s3Key: value };
          } catch (error) {
            console.error(`Error fetching signed URL for ${key}:`, error);
            return { key, signedUrl: null, s3Key: value };
          }
        }
        return { key, signedUrl: null, s3Key: null };
      });

      const urls = await Promise.all(urlPromises);

      // Add signed URLs to the response data
      response.data.data.imageUrls = urls.reduce((acc, { key, signedUrl, s3Key }) => {
        acc[key] = signedUrl;
        acc[`${key}Key`] = s3Key;
        return acc;
      }, {} as Record<string, string | null>);
    }

    return response.data;
  }

  static async createAppInfo(data: {
    tenantId: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    colorTheme?: string;
    prescriptionHeader?: string;
    prescriptionBackground?: string;
    prescriptionFooter?: string;
  }) {
    const response = await this.request("post", "/app-info", data);
    console.log("createAppInfo response:", response);
    return response.data;
  }

  static async updateAppInfo(id: string, data: {
    tenantId: string;
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    colorTheme?: string;
    prescriptionHeader?: string;
    prescriptionBackground?: string;
    prescriptionFooter?: string;
  }) {
    const response = await this.request("patch", `/app-info/${id}`, data);
    console.log("updateAppInfo response:", response);
    return response.data;
  }
  // DASHBOARD APIs

  static async getPatientDashboard() {
    const response = await this.request("get", "/patient/dashboard");
    console.log("getPatientDashboard response:", response);
    return response.data;
  }

  static async getPurchaseDashboard() {
    const response = await this.request("get", "/purchase/dashboard");
    console.log("getPurchaseDashboard response:", response);
    return response.data;
  }

  static async getSaleDashboard() {
    const response = await this.request("get", "/sale/dashboard");
    console.log("getSaleDashboard response:", response);
    return response.data;
  }

  static async getPanchakarmaPurchaseDashboard() {
    const response = await this.request("get", "/panchakarma-purchase/dashboard");
    console.log("getPanchakarmaPurchaseDashboard response:", response);
    return response.data;
  }

  static async getPanchakarmaSaleDashboard() {
    const response = await this.request("get", "/panchakarma-sale/dashboard");
    console.log("getPanchakarmaSaleDashboard response:", response);
    return response.data;
  }

  static async getDoctorPrescriptionDashboard(startDate: string, userId: string) {
    const response = await this.request("get", `/prescription/dashboard?startDate=${encodeURIComponent(startDate)}&user=${userId}`);
    console.log("getDoctorPrescriptionDashboard response:", response);
    return response.data;
  }

  static async getRevenueDashboard() {
    const response = await this.request("get", "/revenue/dashboard");
    console.log("getRevenueDashboard response:", response);
    return response.data;
  }

  static async getExpenseDashboard(startDate: string, endDate: string) {
    const response = await this.request("get", `/expense-register/dashboard?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
    console.log("getExpenseDashboard response:", response);
    return response.data;
  }
}

export default ApiManager;