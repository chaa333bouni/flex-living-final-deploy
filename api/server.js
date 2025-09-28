const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// --- Configuration ---
app.use(cors()); 
app.use(express.json()); 

// Serve static files from Angular build
app.use(express.static(path.join(process.cwd(), 'dist', 'flex-living-dashboard')));

// --- Data Management ---
// Read JSON files reliably with fs and path
const reviewsPath = path.join(process.cwd(), 'api', 'mockReviews.json');
const initialReviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));

const googleMockPath = path.join(process.cwd(), 'api', 'mockGoogleApiResponse.json');
const googleApiMock = JSON.parse(fs.readFileSync(googleMockPath, 'utf-8'));

let reviews = initialReviewsData.result.map(review => {
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

// --- API Routes ---
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
    console.error('Error in showcase-properties:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Handle Angular routes - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'flex-living-dashboard', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// For Vercel, export the app
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;