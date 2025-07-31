const express = require('express')
const router = express.Router()
const heldSlotController = require('../controllers/heldSlotController')

router.post('/start', heldSlotController.start_slot_hold)

router.post('/extend', heldSlotController.extend_held_slot)

router.post('/confirm', heldSlotController.confirm_held_slot)

module.exports = router
