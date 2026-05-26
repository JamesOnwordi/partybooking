import heldSlotService from '../services/heldSlotService.js'

export const createHeldSlot = async (req, res) => {
  try {
    const heldSlot = await heldSlotService.createHeldSlot(req.body)

    res.status(201).json({
      success: true,
      heldSlot
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export const extendHeldSlot = async (req, res) => {
  try {
    const heldSlotId = req.body.id

    heldSlotService.extendHeldSlot(heldSlotId)

    res.status(200).json({ success: true })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const getHeldSlot = async (req, res) => {
  try {
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const deleteHeldSlot = async (req, res) => {
  try {
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
