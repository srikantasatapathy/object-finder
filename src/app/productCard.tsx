import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';

type Product = {
  name: string;
  description: string;
  image?: string;
  url: string;
};
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105">
      {product.image && (
        <CardMedia
          component="img"
          height="140"
          image={product.image}
          alt={product.name}
          className="object-cover"
        />
      )}
      <CardContent className="bg-white p-4">
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          className="text-gray-900 font-bold"
        >
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          className="text-gray-700"
        >
          {product.description}
        </Typography>
      </CardContent>
      <div className="p-4 bg-gray-100">
        <Button
          size="small"
          color="primary"
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 rounded-md shadow-md"
        >
          View More
        </Button>
      </div>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProductCard;
