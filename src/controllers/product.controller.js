import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProduct = asyncHandler(async (req, res) => {
  try {
    const productData = req.body;

    const discountPrice = Math.round(
      productData.price * (1 - productData.discountPercentage / 100)
    );

    const product = await Product.create({ ...productData, discountPrice });

    return res
      .status(201)
      .json(new ApiResponse(201, product, "product created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while creating product"
    );
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const discountPrice = Math.round(
      productData.price * (1 - productData.discountPercentage / 100)
    );

    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          ...productData,
          discountPrice,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, product, "product updated successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while updating product"
    );
  }
});

export const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    return res
      .status(200)
      .json(new ApiResponse(200, product, "product fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "something went wrong while fetching product"
    );
  }
});

// export const fetchAllProducts = asyncHandler(async (req, res) => {
//   // filter = {"category":["smartphone","laptops"]}
//   // sort = {_sort:"price",_order="desc"}
//   // pagination = {_page:1,_limit=10}

//   try {
//     const userRole = "user" || req.user?.role;
//     const {
//       brand,
//       category,
//       _sort,
//       _order,
//       _page = 1,
//       _limit = 10,
//     } = req.query;

//     let condition = {};
//     if (userRole !== "admin") {
//       condition.deleted = { $ne: true };
//     }

//     let query = Product.find(condition);
//     let totalProductsQuery = Product.find(condition);

//     if (category) {
//       query = query.find({
//         category: { $in: category.split(",") },
//       });
//       totalProductsQuery = totalProductsQuery.find({
//         category: { $in: category.split(",") },
//       });
//     }

//     if (brand) {
//       query = query.find({ brand: { $in: brand.split(",") } });
//       totalProductsQuery = totalProductsQuery.find({
//         brand: { $in: brand.split(",") },
//       });
//     }

//     if (_sort && _order) {
//       query = query.sort({ [_sort]: _order });
//     }

//     if (_page && _limit) {
//       const pageSize = _limit;
//       const page = _page;
//       query = query.skip(pageSize * (page - 1)).limit(pageSize);
//     }

//     const products = await query.exec();
//     const totalDocs = await totalProductsQuery.count().exec();
//     console.log({ totalDocs });

//     return res
//       .status(200)
//       .set("X-Total-Count", totalDocs)
//       .json(new ApiResponse(200, products, "products fetched successfully"));
//   } catch (error) {
//     console.log(error);
//     throw new ApiError(
//       400,
//       error?.message || "something went wrong while fetching products"
//     );
//   }
// });

export const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const userRole = req.user?.role;
    const {
      brand,
      category,
      _sort,
      _order,
      _page = 1,
      _limit = 10,
    } = req.query;

    const page = parseInt(_page);
    const limit = parseInt(_limit);

    let matchStage = {};
    if (userRole !== "admin") {
      matchStage.deleted = { $ne: true };
    }

    // Initial pipeline for totalDocs
    const totalDocsPipeline = [
      { $match: matchStage },
      { $match: category ? { category: { $in: category.split(",") } } : {} },
      { $match: brand ? { brand: { $in: brand.split(",") } } : {} },
      { $group: { _id: null, totalDocs: { $sum: 1 } } },
    ];

    const [totalDocsFilter] = await Product.aggregate(totalDocsPipeline);

    // Main pipeline for products
    const pipeline = [
      { $match: matchStage },
      { $match: category ? { category: { $in: category.split(",") } } : {} },
      { $match: brand ? { brand: { $in: brand.split(",") } } : {} },
      {
        $sort:
          _sort && _order
            ? { [_sort]: _order === "desc" ? -1 : 1 }
            : { _id: 1 },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: { __v: 0 } },
    ];

    const products = await Product.aggregate(pipeline);
    const totalDocs = totalDocsFilter ? totalDocsFilter.totalDocs : 0;

    return res
      .status(200)
      .set("X-Total-Count", totalDocs)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(
      400,
      error?.message || "Something went wrong while fetching products"
    );
  }
});
