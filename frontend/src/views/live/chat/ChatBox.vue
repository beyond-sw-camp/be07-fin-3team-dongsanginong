<template>
  <div class="chat-container">
    <div class="chat-room">
      <h3>{{ title }} 채팅방</h3>
      <div class="message-list" ref="messageList">
        <div
          v-for="message in messages"
          :key="message.timestamp"
          class="message-item"
        >
          <strong :style="{ color: message.isOwner ? '#d9534f' : '#5bc0de' }">
            {{ message.isOwner ? '👑 ' : '' }}{{ message.name }}:
          </strong>
          {{ message.content }}
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="chatMessage"
          @keyup.enter="sendMessage"
          placeholder="메시지를 입력하세요"
        />
        <button @click="sendMessage">전송</button>
      </div>
    </div>
  </div>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';

export default {
  props: {
    liveId: {
      type: String,
      required: true,
    },
    currentSellerId: {
      type: String, // 개설자의 sellerId를 받음
      required: true
    },
    title: {  // 농장 이름을 prop으로 전달받음
      type: String,
      required: true,
  },
  },
  data() {
    return {
      chatMessage: '',
      messages: [],
      stompClient: null,
      subscription: null,
      memberId: null,
      sellerId: null,
      senderName: null,
      token: null,
      isPublisher: false,
    };
  },
  async mounted() {
    this.token = localStorage.getItem('accessToken');
    this.memberId = localStorage.getItem('memberId');
    this.sellerId = localStorage.getItem('sellerId');
    this.senderName = localStorage.getItem('username');

    console.log('Token:', this.token);
    console.log('memberId:', this.memberId, 'sellerId:', this.sellerId, 'senderName:', this.senderName, 'isPublisher:', this.isPublisher);

    this.enterChatRoom();
  },
  updated() {
      this.scrollToBottom();
  },
  methods: {
    enterChatRoom() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      this.messages = [];
      const socket = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/live-service/ws`);
      this.stompClient = Stomp.over(socket);

      const headers = {
        Authorization: `Bearer ${this.token}`,
        memberId: this.memberId,
        sellerId: this.sellerId,
        sessionId: this.liveId
      };

      this.stompClient.connect(
        headers,
        () => {
          this.subscription = this.stompClient.subscribe(`/topic/live/${this.liveId}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log('Received Message:', receivedMessage);
            this.messages.push(receivedMessage);
          });
        },
        (error) => {
          console.error('WebSocket connection error:', error);
        }
      );
    },

    sendMessage() {
      if (this.stompClient && this.chatMessage.trim() !== '') {
        const message = {
          memberId: this.memberId,
          sellerId: this.sellerId,
          liveId: this.liveId,
          content: this.chatMessage,
          name: this.senderName,
          isOwner: this.isPublisher,
          type: 'TEXT',
        };

        this.stompClient.send(`/app/chat/${this.liveId}/sendMessage`, JSON.stringify(message));
        this.chatMessage = '';
      }
    },
    scrollToBottom() {
      const messageList = this.$refs.messageList;
          if (messageList) {
              messageList.scrollTop = messageList.scrollHeight;
          }
   },
  },
};
</script>


<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #f8f9fa;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 8px;
}

.chat-room {
  margin-top: 20px;
}

.message-list {
  background-color: #ffffff;
  margin-bottom: 10px;
  max-height: 550px; /* 고정된 높이 */
  height: 532px;
  overflow-y: auto; /* 스크롤 생성 */
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.message-item {
  margin-bottom: 10px;
}

.chat-input {
  display: flex;
  align-items: center;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.chat-input button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.chat-input button:hover {
  background-color: #218838;
}
</style>