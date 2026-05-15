import express from 'express'

const router = express.Router()

// Simplified webhook (no User model dependency for now)
router.post('/clerk', async (req, res) => {
  try {
    console.log('Webhook received:', req.body.type)
    res.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router