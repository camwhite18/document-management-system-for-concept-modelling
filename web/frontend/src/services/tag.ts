import {fetchApi} from "./utils";


export interface TaggedDocument {
    tagged_text: string;
}

export const performTag = (text: string): Promise<TaggedDocument> => {
    return fetchApi<TaggedDocument>("/tag/", {
        method: "POST",
        body: JSON.stringify({
            text: text
        })
    });
}