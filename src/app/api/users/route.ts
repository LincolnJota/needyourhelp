import { NextRequest, NextResponse } from 'next/server'
import { addUser, removeUser, getConnectedUsers } from '../../../stores/usersStore';
import Pusher from 'pusher'

export async function GET() {

    console.log("Usuários conectados: ", getConnectedUsers());
    

    return new Response(JSON.stringify({ users: getConnectedUsers() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

}