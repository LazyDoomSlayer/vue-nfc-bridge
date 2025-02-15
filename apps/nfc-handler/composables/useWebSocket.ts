import { ref, onUnmounted, Ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import { ENFCScanStatus, EWebsocketClient, INfcResponseDTO, INfcScanDTO } from '../types'

interface IUseWebSocket {
  socket: Ref<Socket | null>
  incomingMessage: Ref<unknown[]>
  appId: Ref<string | null>
  devEUI: Ref<string | null>
  connectSocket: () => void
  sendNfcResponseMessage: (status: ENFCScanStatus) => void
  disconnectSocket: () => void
}

export function useWebSocket(accessToken: string, clientType: EWebsocketClient): IUseWebSocket {
  const socket = ref<Socket | null>(null)
  const incomingMessage = ref<unknown[]>([])
  const appId = ref<string | null>(null)
  const devEUI = ref<string | null>(null)

  const connectSocket = () => {
    if (!accessToken) throw new Error('Could not get token')
    if (socket.value) throw new Error('Already connected. Try disconnecting first.')

    socket.value = io(import.meta.env.VITE_NEST_ENDPOINT, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      withCredentials: true,
      rejectUnauthorized: false,
      secure: true,
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

    socket.value.on('nfc-scan', (data) => {
      console.log('📡 Received NFC scan data:', data)
      incomingMessage.value = data as unknown[]

      const nfcScanObject = data as INfcScanDTO
      appId.value = nfcScanObject.applicationExtendedUniqueIdentifier ?? null
      devEUI.value = nfcScanObject.deviceExtendedUniqueIdentifier ?? null
    })
  }

  const sendNfcResponseMessage = (status: ENFCScanStatus) => {
    try {
      const nfcResponseObject: INfcResponseDTO = { status }

      if (status === ENFCScanStatus.SUCCESS) {
        nfcResponseObject.message = '✅ All good, you can clear and scan another'
      }

      socket.value?.emit('nfc-response', nfcResponseObject)
    } catch (error) {
      console.error('❌ Error sending NFC response:', error)
    }
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
    incomingMessage,
    appId,
    devEUI,
    connectSocket,
    sendNfcResponseMessage,
    disconnectSocket,
  }
}
