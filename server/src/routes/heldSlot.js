import express from 'express.js'
import heldSlotController from '../controllers/heldSlotController.js'

const router = express.Router()

router.post('/start', heldSlotController.start_slot_hold)

router.post('/extend', heldSlotController.extend_held_slot)

router.get('/:heldSlotId', heldSlotController.get_held_slot)

router.delete('/delete', heldSlotController.delete_held_slot)

module.exports = router
