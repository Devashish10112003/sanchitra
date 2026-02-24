import dotenv from "dotenv";

dotenv.config();

function getEnvVar(name:string):string{
    const value=process.env[name];

    if(!value){
        throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
}

export const ENV_VARS={
    JWT_SECRET:getEnvVar("JWT_SECRET"),
}