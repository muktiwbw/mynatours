const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const { promisify } = require('util');

exports.avatar = async (file, filename, oldFilename = null, dim = 400) => {
  // * Save new user image
  await sharp(file.buffer)
  .resize(dim, dim)
  .toFile(path.join(__dirname, '..', '..', 'public', 'img', 'users', filename));

  if (oldFilename) {
    // * Delete current user image
    const currentPhotoFullPath = path.join(__dirname, '..', '..', 'public', 'img', 'users', oldFilename);
    
    let exists;
  
    /**
     * * Needs to be done this way because it returns
     * * the checking result in a callback function
     */
    try {
      await promisify(fs.access)(currentPhotoFullPath);
  
      exists = true;
    } catch (error) {
      exists = false;
    }
  
    if (exists) {
      await promisify(fs.unlink)(currentPhotoFullPath);
    }
  }
};