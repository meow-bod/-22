'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

interface Message {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
}

export default function ChatPage({ params }: { params: { matchId: string } }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherPet, setOtherPet] = useState<any>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const { matchId } = params;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
        } else {
          setMessages(messagesData || []);
        }

        // Fetch match details to find the other pet
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('pet1_id, pet2_id')
          .eq('id', matchId)
          .single();

        if (matchError) {
          console.error('Error fetching match data:', matchError);
        } else if (matchData) {
          const { data: userPet, error: userPetError } = await supabase
            .from('pets')
            .select('id')
            .eq('owner_id', user.id)
            .single();

          if (userPetError) {
            console.error('Error fetching user pet:', userPetError);
          } else if (userPet) {
            const otherPetId = matchData.pet1_id === userPet.id ? matchData.pet2_id : matchData.pet1_id;
            const { data: otherPetData, error: otherPetError } = await supabase
              .from('pets')
              .select('*')
              .eq('id', otherPetId)
              .single();
            
            if (otherPetError) {
              console.error('Error fetching other pet data:', otherPetError);
            } else {
              setOtherPet(otherPetData);
            }
          }
        }
      }
      setLoading(false);
    };

    fetchInitialData();

    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, matchId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      alert('訊息傳送失敗！');
    } else {
      setNewMessage('');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><div>讀取中...</div></div>;
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-center">與 {otherPet ? otherPet.name : '...'} 的聊天室</h1>
        {otherPet && (
          <div className="text-center text-gray-600 mt-2">
            <p>{otherPet.breed} | {otherPet.gender}</p>
          </div>
        )}
      </div>
      <div className="flex-grow bg-gray-100 rounded-lg p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${msg.sender_id === user?.id ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="輸入訊息..."
          className="flex-grow rounded-l-lg border-2 border-r-0 border-gray-300 p-2 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 rounded-r-lg hover:bg-indigo-700 font-semibold">
          傳送
        </button>
      </form>
    </div>
  );
}