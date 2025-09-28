const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3001;

// --- Configuration ---
app.use(cors()); 
app.use(express.json()); 

// --- Data management ---
const initialReviews = require('./mockReviews.json');
const mockGoogleApiResponse = require('./mockGoogleApiResponse.json');
let reviews = initialReviews.result.map(review => {
  const totalRating = review.reviewCategory.reduce((sum, cat) => sum + cat.rating, 0);
  const averageRating = totalRating / review.reviewCategory.length;
  const categories = review.reviewCategory.reduce((obj, cat) => {
    obj[cat.category] = cat.rating;
    return obj;
  }, {});

  return {
    id: review.id,
    listingName: review.listingName,
    guestName: review.guestName,
    channel: 'Hostaway',
    publicReview: review.publicReview,
    submittedAt: new Date(review.submittedAt).toISOString(),
    overallRating: parseFloat(averageRating.toFixed(2)),
    categories: categories,
    isApproved: false
  };
});

// --- Routes API ---
app.get('/api/google-reviews/:listingName', (req, res) => {
  const listingName = req.params.listingName;

  console.log(`[Backend] Recherche d'avis Google simulés pour : ${listingName}`);

  const apiResponse = mockGoogleApiResponse[listingName];

  if (apiResponse) {
    res.json(apiResponse);
  } else {
    res.json(mockGoogleApiResponse.default);
  }
});

app.get('/api/reviews', (req, res) => {
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  res.json(sortedReviews);
});

app.post('/api/reviews/:id/approve', (req, res) => {
  const reviewId = parseInt(req.params.id, 10);
  const { isApproved } = req.body;
  const reviewToUpdate = reviews.find(r => r.id === reviewId);

  if (reviewToUpdate) {
    reviewToUpdate.isApproved = isApproved;
    console.log(`Review ${reviewId} status updated to: ${isApproved}`);
    res.status(200).json(reviewToUpdate);
  } else {
    res.status(404).json({ message: "Review not found" });
  }
});

app.get('/api/reviews/public', (req, res) => {
  const { listingName } = req.query;
  let publicReviews = reviews.filter(r => r.isApproved);
  if (listingName) {
    publicReviews = publicReviews.filter(r => r.listingName === listingName);
  }
  res.json(publicReviews);
});

// =================================================================
// 4. Route for the showcase page (where the approved propreties)
// =================================================================
app.get('/api/showcase-properties', (req, res) => {
  try {
    const approvedReviews = reviews.filter(r => r.isApproved);
    const uniqueListingNames = [...new Set(approvedReviews.map(r => r.listingName))];

    const propertiesWithImages = uniqueListingNames.map(listingName => {
      let imageUrl = 'assets/house1.jpg'; // random image

      // Put image from the assets folder.
      if (listingName.includes('Shoreditch Heights')) {
        imageUrl = 'assets/house1.jpg';
      } else if (listingName.includes('Maple Street')) {
        imageUrl = 'assets/house2.jpg';
      } else if (listingName.includes('Oak Avenue')) {
        imageUrl = 'assets/house3.jpg';
      }

      return {
        listingName: listingName,
        imageUrl: imageUrl
      };
    });

    res.json(propertiesWithImages);

  } catch (error) {
    console.error("Erreur dans /api/showcase-properties:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


module.exports = app;

