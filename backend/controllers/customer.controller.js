import { getCustomerById as getCustomerByIdService } from "../services/customer.service.js";
function getCustomers(req, res){
    res.json({
        "message": "Customer Route Working"
    })
}

function getCustomerById(req, res) {
    const id = req.params.id;
    const customerId = getCustomerByIdService(id);

    res.json({
        customerId: customerId
    });
}
export {getCustomers, getCustomerById}

