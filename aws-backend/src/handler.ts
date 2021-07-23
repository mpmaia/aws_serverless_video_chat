import {createResponse} from "./utils/http";

export const hello = async (event) => {
    return createResponse(200, {
            message: 'Request Echo',
            input: event,
        });
};
