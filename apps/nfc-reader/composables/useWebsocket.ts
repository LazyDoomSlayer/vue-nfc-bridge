import { ref, onUnmounted, Ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import {
  ENFCScanStatus,
  EWebsocketClient,
  INFCRecordObject,
  INfcResponseDTO,
  INfcScanDTO,
} from '../types'

interface IUseWebSocketResponse {
  socket: Ref<Socket | null>
  nfcResponseMessage: Ref<string | null>
  connectSocket: () => void
  handleNFCResponse: (data: INfcResponseDTO) => void
  sendMessage: (devEUI: string) => void
}

export default function useWebSocket(
  accessToken: string,
  clientType: EWebsocketClient,
  nfcRecords: Ref<INFCRecordObject[]>,
): IUseWebSocketResponse {
  const socket = ref<Socket | null>(null)
  const nfcResponseMessage = ref<string | null>(null)

  const connectSocket = () => {
    if (!accessToken) throw new Error('Could not get access token')
    if (socket.value) throw new Error('Already connected. Try disconnecting first.')

    socket.value = io(import.meta.env.VITE_NEST_ENDPOINT, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      secure: true,
      withCredentials: true,
      rejectUnauthorized: false,
      auth: {
        token: accessToken,
        client: clientType,
      },
    })

    socket.value.on('connect', () => {
      console.log('✅ Connected to WebSocket Server')
    })

    socket.value.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket Server')
    })

    socket.value.on('nfc-response', (data) => {
      console.log('📡 NFC Response from Server:', data)
      handleNFCResponse(data as INfcResponseDTO)
    })
  }

  const handleNFCResponse = (data: INfcResponseDTO) => {
    nfcResponseMessage.value = data.message ?? null

    if (data.status === ENFCScanStatus.SUCCESS) {
      nfcRecords.value = []
      return
    }
  }

  const sendMessage = (devEUI: string) => {
    if (!devEUI) throw new Error('Could not get device ID')

    const nfcScanMessageObject: INfcScanDTO = {
      deviceExtendedUniqueIdentifier: devEUI,
    }

    socket.value?.emit('nfc-scan', nfcScanMessageObject)
  }

  const disconnectSocket = () => {
    socket.value?.disconnect()
    socket.value = null
  }

  onUnmounted(() => {
    disconnectSocket()
  })

  return {
    // @ts-expect-error Readonly remove
    socket,
    nfcResponseMessage,
    connectSocket,
    sendMessage,
    disconnectSocket,
  }
}
