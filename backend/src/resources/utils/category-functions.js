const CategoryModel = require('../models/Category');


module.exports.findCategory = async (object) => {
    try {
        let categoryExist = await CategoryModel.find(object)
        if (categoryExist.length == 0) {
            return {
                success: false,
                code: 1,
                message: "No Data!"
            }
        }
        return {
            success: true,
            code: 1,
            data: categoryExist
        }
    } catch (error) {
        return {
            success: false,
            code: 0,
            message: error
        }
    }
}