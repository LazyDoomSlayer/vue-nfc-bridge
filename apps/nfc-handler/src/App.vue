<script setup lang="ts">
import { ref } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

const accessToken = ref<string>('')

const {
  socket,
  incomingMessage,
  appId,
  devEUI,
  connectSocket,
  sendNfcResponseMessage,
  disconnectSocket,
} = useWebSocket(accessToken.value, EWebsocketClient.HANDLER)
</script>

<template>
  <div>
    <h2>WebSocket NFC Handler</h2>

    <!-- WebSocket Controls -->
    <button @click="connectSocket">Connect</button>
    <button @click="disconnectSocket" :disabled="!socket">Disconnect</button>

    <!-- Display Incoming NFC Messages -->
    <p v-if="incomingMessage.length">📡 Incoming NFC Message: {{ incomingMessage }}</p>

    <!-- Send NFC Response Messages -->
    <button @click="sendNfcResponseMessage(ENFCScanStatus.SUCCESS)" :disabled="!socket">
      ✅ Send Success Response
    </button>

    <button @click="sendNfcResponseMessage(ENFCScanStatus.FAILURE)" :disabled="!socket">
      ❌ Send Failure Response
    </button>

    <!-- Display App ID & Device EUI -->
    <p v-if="appId">App ID: {{ appId }}</p>
    <p v-if="devEUI">Device EUI: {{ devEUI }}</p>
  </div>
</template>

<style scoped>
/* Main Container */
.desktop-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-family: 'Arial', sans-serif;
  padding: 20px;
}

/* Title Styling */
.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 25px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

/* Button Group for Alignment */
.button-group {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

/* General Button Styling */
.button {
  padding: 14px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease-in-out;
  border: none;
}

/* Primary Button (Connect) */
.primary {
  background-color: #4caf50;
  color: white;
}

.primary:hover {
  background-color: #45a049;
}

/* Secondary Button (Disconnect) */
.secondary {
  background-color: #f44336;
  color: white;
}

.secondary:hover {
  background-color: #d32f2f;
}

/* Info Section */
.info-section {
  background-color: #292929;
  padding: 20px;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
  text-align: left;
  margin-top: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

/* Information Styling */
.info-section p {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 16px;
}

/* Labels & Values */
.label {
  font-weight: bold;
  color: #bdbdbd;
}

.value {
  color: #ffffff;
}

/* Responsive Styling */
@media (max-width: 768px) {
  .info-section {
    max-width: 300px;
  }

  .button {
    font-size: 14px;
    padding: 12px 16px;
  }
}

.access-token-input {
  padding: 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #333;
  width: 100%;
  background-color: #1e1e1e;
  color: #e0e0e0;
  margin-bottom: 2rem;
}
</style>
