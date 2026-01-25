import { ObjectSchema, Field } from '@objectstack/spec/data';

/**
 * Product Object - Demonstrates Modern Field Types
 * 
 * This example shows the new field types added to ObjectStack:
 * - slider: For numeric ranges with visual feedback
 * - qrcode: For product barcodes and QR codes
 * - geolocation: For GPS tracking of products
 */
export const Product = ObjectSchema.create({
  name: 'product',
  label: 'Product',
  icon: 'package',
  titleFormat: '{name}',
  compactLayout: ['name', 'price', 'status', 'stock_level'],
  enable: {
    apiEnabled: true,
    trackHistory: true,
    mru: true,
  },
  fields: {
    // Basic fields
    name: Field.text({ 
      required: true,
      label: 'Product Name',
      maxLength: 200,
    }),
    
    description: Field.richtext({
      label: 'Description',
      description: 'Rich text product description',
    }),
    
    // Price with currency
    price: Field.currency({ 
      required: true,
      label: 'Price',
      min: 0,
      precision: 10,
      scale: 2,
    }),
    
    // NEW: Slider field for stock level indicator
    stock_level: Field.slider({
      label: 'Stock Level',
      description: 'Current stock level (0-100)',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 50,
      showValue: true,
      marks: {
        '0': 'Empty',
        '25': 'Low',
        '50': 'Medium',
        '75': 'High',
        '100': 'Full',
      },
    }),
    
    // NEW: QR Code field for product barcode
    barcode: Field.qrcode({
      label: 'Product Barcode',
      description: 'Scannable product barcode',
      barcodeFormat: 'ean13',
      displayValue: true,
      allowScanning: true,
      unique: true,
      index: true,
    }),
    
    // NEW: QR Code for quick access URL
    qr_url: Field.qrcode({
      label: 'Product QR Code',
      description: 'QR code linking to product page',
      barcodeFormat: 'qr',
      qrErrorCorrection: 'M',
      displayValue: false,
    }),
    
    // NEW: Geolocation for warehouse location
    warehouse_location: Field.geolocation({
      label: 'Warehouse Location',
      description: 'GPS coordinates of warehouse',
      displayMap: true,
      allowGeocoding: true,
    }),
    
    // Existing enhanced field types
    category_color: Field.color({
      label: 'Category Color',
      description: 'Color coding for product category',
      colorFormat: 'hex',
      allowAlpha: false,
      presetColors: [
        '#FF0000', // Electronics
        '#00FF00', // Food
        '#0000FF', // Clothing
        '#FFFF00', // Books
        '#FF00FF', // Toys
      ],
    }),
    
    rating: Field.rating(5, {
      label: 'Customer Rating',
      description: 'Average customer rating',
      allowHalf: true,
    }),
    
    status: Field.select({
      label: 'Status',
      options: [
        { label: 'Active', value: 'active', color: '#00AA00', default: true },
        { label: 'Discontinued', value: 'discontinued', color: '#AA0000' },
        { label: 'Coming Soon', value: 'coming_soon', color: '#0000AA' },
      ],
    }),
    
    // Address for return location
    return_address: Field.address({
      label: 'Return Address',
      description: 'Address for product returns',
      addressFormat: 'us',
    }),
  },
});
