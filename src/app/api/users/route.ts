import { getConnectedUsers } from '../../../stores/usersStore';

export async function GET() {

    console.log("Usuários conectados: ", getConnectedUsers());
    

    return new Response(JSON.stringify({ users: getConnectedUsers() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

}