import { APIService } from '../api'

describe('APIService', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('sends messages correctly', async () => {
    const mockResponse = { message: 'AI response' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const response = await APIService.sendMessage('test message', [])
    expect(response).toBe(mockResponse.message)
  })

  it('handles errors appropriately', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await expect(APIService.sendMessage('test', [])).rejects.toThrow('Network error')
  })
}) 