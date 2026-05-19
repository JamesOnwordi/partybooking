const packageSeed = [
  {
    name: 'Galaxy',

    active: true,

    availability: {
      days: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      excludeHolidays: false
    },

    capacity: {
      includedKids: 8,
      includedAdults: 8
    },

    pricing: {
      basePrice: 495,
      cleaningFee: 0,
      additionalAdultPrice: 5,
      additionalChildPrice: 24.9
    },

    addOns: []
  },
  {
    name: 'Solar',

    active: true,

    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      excludeHolidays: true
    },

    capacity: {
      includedKids: 8,
      includedAdults: 8
    },

    pricing: {
      basePrice: 295,
      cleaningFee: 40,
      additionalAdultPrice: 5,
      additionalChildPrice: 20.9
    },
    addOns: []
  },
  {
    name: 'Solar',

    active: true,

    availability: {
      days: ['Friday', 'Saturday', 'Sunday'],
      excludeHolidays: false
    },

    capacity: {
      includedKids: 8,
      includedAdults: 8
    },

    pricing: {
      basePrice: 395,
      cleaningFee: 40,
      additionalAdultPrice: 5,
      additionalChildPrice: 24.9
    },
    addOns: []
  }
]

export default packageSeed
