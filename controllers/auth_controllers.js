import {Client,Account,ID,Functions} from "appwrite"

const client = new Client()
.setEndpoint('https://treasurenfts2.online/v1') // Your API Endpoint
.setProject('67cc44870036518f1c7b')              // Your project ID

const account = new Account(client);

// complete verification for the client
export const updateVerification = async (userId, secret) => {
    try{
       const response=await account.updateVerification(userId, secret);
         console.log(response); // Success
            return response;
    }
    catch(error){
        console.log(error); // Failure
        throw error;
    }
}

// update and reset the password
export const updateNewPassword = async (userId, secret, password,password_confirm) => {
    try {
        const response = await account.updateRecovery(userId, secret, password,password_confirm);
        console.log(response); // Success
        return response;
    } catch (error) {
        console.log(error); // Failure
        throw error;
    }
};
