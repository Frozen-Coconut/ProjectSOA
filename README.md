# Project SOA

## Documentation
* ### Endpoint 16 (Upload Image)
  Method : POST  
  URL : /api/images
  * Header : 
    * `Authorization:{{api_key}}`  
  * Body : 
    * `image={{image}}`
* ### Endpoint 17 (Delete Image)
  Method : DELETE  
  URL : /api/images/:image_id
  * Header : 
    * `Authorization:{{api_key}}`
* ### Endpoint 18 (Text to Image)
  Method : POST  
  URL : /api/tasks/text-to-image
  * Header : 
    * `Authorization:{{api_key}}`
  * Body : 
    * `text={{text}}`
* ### Endpoint 19 (Image Classification)
  Method : POST  
  URL : /api/tasks/image-classification
    * Header : 
      * `Authorization:{{api_key}}`
    * Body : 
      * `image_id={{image_id}}`
* ### Endpoint 20 (Image Segmentation)
  Method : POST  
  URL : /api/tasks/image-segmentation
    * Header : 
      * `Authorization:{{api_key}}`
    * Body : 
      * `image_id={{image_id}}`
