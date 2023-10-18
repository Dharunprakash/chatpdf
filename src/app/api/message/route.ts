import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validator/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req:NextRequest)=>{
    const body =  await req.json();

    const {getUser}=getKindeServerSession()
    const user= getUser()
    const {id:userId}=user
   

  const {fileId,message}=SendMessageValidator.parse(body)

  const file =await db.file.findFirst({
      where:{
          id:fileId,
          userId
      }
  })

  if(!userId){
        return new Response('Unauthorized', {status: 401})
    }

  await db.message.create({
    data:{
      text:message,
      isUserMessage:true,
      userId,
      fileId,
    },
  })   
}