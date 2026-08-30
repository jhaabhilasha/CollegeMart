const express = require('express');
const router = express.Router();
const { getListings, getListing, createListing, updateListing, deleteListing } = require('../controllers/listingController');
const auth = require('../middleware/auth');
const { 
  createListingValidator, 
  updateListingValidator, 
  listingIdValidator 
} = require('../middleware/validators');

router.get('/', getListings);
router.get('/:id', listingIdValidator, getListing);
router.post('/', auth, createListingValidator, createListing);
router.put('/:id', auth, updateListingValidator, updateListing);
router.delete('/:id', auth, listingIdValidator, deleteListing);

module.exports = router;
