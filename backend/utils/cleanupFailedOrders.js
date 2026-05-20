import cron from 'node-cron'
import Order from '../models/Order.js'

const setupFailedOrdersCleanup = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Running failed orders cleanup...', new Date().toISOString())
    
    try {
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      const result = await Order.updateMany(
        { 
          paymentStatus: 'failed', 
          createdAt: { $lt: cutoffDate },
          status: { $in: ['pending', 'processing'] }
        },
        { 
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: 'Auto-cancelled due to payment failure (24h timeout)'
          }
        }
      )
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Cleaned up ${result.modifiedCount} failed orders`)
      } else {
        console.log('No failed orders to clean up')
      }
    } catch (error) {
      console.error('❌ Failed orders cleanup error:', error.message)
    }
  })
  
  console.log('✅ Failed orders cleanup cron job scheduled (every hour)')
}

export default setupFailedOrdersCleanup