const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');


dotenv.config();


const app = express();


app.use(express.json());

app.use(cors({
  origin: [process.env.FRONTEND_URL, "https://referbiz-lovat.vercel.app/"],
  credentials: true
}));


app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  abortOnLimit: true
}));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', require('./routes/auth_routes'));
app.use('/api/agents', require('./routes/agent_routes'));
app.use('/api/uploads', require('./routes/upload_routes'));
app.use('/api/contacts', require('./routes/contact_routes'));
app.use('/api/campaigns', require('./routes/campaign_routes'));
app.use('/api/referrals', require('./routes/referral_routes'));
app.use('/api/rewards', require('./routes/reward_routes'));
app.use('/api/messages', require('./routes/message_routes'));
app.use('/api/analytics', require('./routes/analytics_routes'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
  
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });