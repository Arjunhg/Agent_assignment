import { Box, Container, Typography, Grid, Link, IconButton, Divider } from "@mui/material";
import { LinkedIn, Twitter, Facebook, Instagram } from "@mui/icons-material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f8fafc",
        py: 5,
        borderTop: "1px solid",
        borderColor: "divider",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
              ReferBiz
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Empowering businesses with intelligent referral management solutions.
              Grow your customer base, track referrals, and reward your advocates.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="primary" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <Instagram />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Product
            </Typography>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Features
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Pricing
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Integrations
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ textDecoration: 'none' }}>
              Roadmap
            </Link>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Resources
            </Typography>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Blog
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Documentation
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Help Center
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ textDecoration: 'none' }}>
              API
            </Link>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Company
            </Typography>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              About Us
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Careers
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Contact
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ textDecoration: 'none' }}>
              Legal
            </Link>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Support
            </Typography>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Contact Support
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              FAQ
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Community
            </Link>
            <Link href="#" color="text.secondary" display="block" sx={{ textDecoration: 'none' }}>
              Status
            </Link>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} ReferBiz. All rights reserved.
          </Typography>
          <Box>
            <Link href="#" color="text.secondary" sx={{ ml: 2, textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link href="#" color="text.secondary" sx={{ ml: 2, textDecoration: 'none' }}>
              Terms of Service
            </Link>
            <Link href="#" color="text.secondary" sx={{ ml: 2, textDecoration: 'none' }}>
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
