import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CustomerDTO } from "../../models/customer.dto";
import { API_CONFIG } from "../../config/api.config";
import { StorageService } from "../storage.service";

@Injectable()

export class CustomerService {

    constructor(
        public httpClient: HttpClient,
        public storageService: StorageService){
    }

    fetchByEmail(email: string) : Observable<CustomerDTO> {
        return this.httpClient.get<CustomerDTO>(
            `${API_CONFIG.baseUrl}/customers/email?value=${email}`);
    }

    getImageFromBucket(id: string) : Observable<any> {
        let url = `${API_CONFIG.bucketBaseUrl}/cp${id}.jpg`;
        return this.httpClient.get( url, {responseType: 'blob'} );
    }

    insert(customer: CustomerDTO) {
        return this.httpClient.post(
            `${API_CONFIG.baseUrl}/customers`,
            customer,
            {
                observe: 'response',
                responseType: 'text'
            }
        )
    }
}