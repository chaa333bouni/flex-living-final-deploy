const express = require('express');
const cors = require('cors');
const app = express();

// --- Configuration ---
app.use(cors()); 
app.use(express.json()); 

// --- Data Management ---
const initialReviews = require('./mockReviews.json');
const googleApiMock = require('./mockGoogleApiResponse.json');

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
  const apiResponse = googleApiMock[listingName];
  res.json(apiResponse || googleApiMock.default);
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

app.get('/api/showcase-properties', (req, res) => {
  try {
    const approvedReviews = reviews.filter(r => r.isApproved);
    const uniqueListingNames = [...new Set(approvedReviews.map(r => r.listingName))];

    const propertiesWithImages = uniqueListingNames.map(listingName => {
      let imageUrl = 'assets/house1.jpg';
      if (listingName.includes('Shoreditch Heights')) {
        imageUrl = 'assets/house1.jpg';
      } else if (listingName.includes('Maple Street')) {
        imageUrl = 'assets/house2.jpg';
      } else if (listingName.includes('Oak Avenue')) {
        imageUrl = 'assets/house3.jpg';
      }
      return { listingName: listingName, imageUrl: imageUrl };
    });
    res.json(propertiesWithImages);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Exporte l'application pour Vercel. C'est la seule chose à la fin.
module.exports = app;
