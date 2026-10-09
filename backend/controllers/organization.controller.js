import { getOrganizations, createOrganization } from "../services/organization.service.js";

async function getOrganizationsController(req, res) {
    const response = await getOrganizations();
    res.json(response);
}

async function createOrganizationsController(req, res){
    const response = await createOrganization(req.body);
    res.status(201).json(response);
}

export { getOrganizationsController, createOrganizationsController };