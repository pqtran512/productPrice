const fetchProductData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/getProductData');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch product data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
};

export default fetchProductData;