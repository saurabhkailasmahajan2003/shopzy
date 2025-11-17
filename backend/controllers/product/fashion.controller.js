import Fashion from '../../models/product/fashion.model.js';

// @desc    Get all fashion items
// @route   GET /api/products/fashion
// @access  Public
export const getFashionItems = async (req, res) => {
  try {
    const {
      gender,
      subCategory,
      isNewArrival,
      onSale,
      isFeatured,
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (gender) {
      query.gender = gender;
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    if (isNewArrival === 'true') {
      query.isNewArrival = true;
    }

    if (onSale === 'true') {
      query.onSale = true;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const fashionItems = await Fashion.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Fashion.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products: fashionItems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get fashion items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fashion items',
      error: error.message,
    });
  }
};

// @desc    Get single fashion item
// @route   GET /api/products/fashion/:id
// @access  Public
export const getFashionItemById = async (req, res) => {
  try {
    const fashionItem = await Fashion.findById(req.params.id);

    if (!fashionItem) {
      return res.status(404).json({
        success: false,
        message: 'Fashion item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: fashionItem },
    });
  } catch (error) {
    console.error('Get fashion item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fashion item',
      error: error.message,
    });
  }
};

// @desc    Create fashion item
// @route   POST /api/products/fashion
// @access  Private/Admin
export const createFashionItem = async (req, res) => {
  try {
    const fashionItem = await Fashion.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Fashion item created successfully',
      data: { product: fashionItem },
    });
  } catch (error) {
    console.error('Create fashion item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fashion item',
      error: error.message,
    });
  }
};

// @desc    Update fashion item
// @route   PUT /api/products/fashion/:id
// @access  Private/Admin
export const updateFashionItem = async (req, res) => {
  try {
    const fashionItem = await Fashion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!fashionItem) {
      return res.status(404).json({
        success: false,
        message: 'Fashion item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fashion item updated successfully',
      data: { product: fashionItem },
    });
  } catch (error) {
    console.error('Update fashion item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fashion item',
      error: error.message,
    });
  }
};

// @desc    Delete fashion item
// @route   DELETE /api/products/fashion/:id
// @access  Private/Admin
export const deleteFashionItem = async (req, res) => {
  try {
    const fashionItem = await Fashion.findByIdAndDelete(req.params.id);

    if (!fashionItem) {
      return res.status(404).json({
        success: false,
        message: 'Fashion item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fashion item deleted successfully',
    });
  } catch (error) {
    console.error('Delete fashion item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fashion item',
      error: error.message,
    });
  }
};

