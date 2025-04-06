import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DogNode } from './pedigreeFormatters';

/**
 * Options for generating a pedigree certificate PDF
 */
export interface PedigreeCertificateOptions {
  dog?: DogNode;  // This can be a full dog object
  
  // Or individual properties can be provided directly
  dogId?: string;
  dogName?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  registrationNumber?: string;
  microchipNumber?: string;
  color?: string;
  isChampion?: boolean;
  healthTested?: boolean;
  ownerId?: string;
  
  // Other certificate options
  certificateDate?: string;
  fontFamily?: string;
  breederName?: string;
  breederAddress?: string;
  certificateNumber?: string;
  registryName?: string;
  
  // Additional dog details
  coat?: string;
  // Replacing size with breeder information from user object
  ownerName?: string;
  ownerAddress?: string;
  
  // Style options
  primaryColor?: string;
  secondaryColor?: string;
  
  // Certificate type options
  isExportCertificate?: boolean;
  isFciCertificate?: boolean;
  
  // New owner information
  newOwnerName?: string;
  newOwnerAddress?: string;
}

/**
 * Structure for 4th generation dogs
 */
interface FourthGeneration {
  sireSireSire?: DogNode | null;
  sireSireDam?: DogNode | null;
  sireDamSire?: DogNode | null;
  sireDamDam?: DogNode | null;
  damSireSire?: DogNode | null;
  damSireDam?: DogNode | null;
  damDamSire?: DogNode | null;
  damDamDam?: DogNode | null;
}

/**
 * Check if a dog is a German Shepherd Dog
 * @param dog The dog to check
 * @returns True if the dog is a German Shepherd Dog
 */
function isGermanShepherd(dog: DogNode | null | undefined): boolean {
  if (!dog) return false;
  const breed = dog.breedObj?.name || dog.breed || '';
  return breed.toLowerCase().includes('german shepherd');
}

/**
 * Get dog cell content based on breed-specific requirements
 * @param dog The dog to get cell content for
 * @param fontSize Font size for the name
 * @param isLastColumn Whether this is the last column (3rd generation) in the pedigree table
 * @returns HTML string for the dog cell
 */
function getDogCellContent(dog: DogNode | null | undefined, fontSize: number, isLastColumn: boolean = false): string {
  if (!dog) return `
    <div style="font-weight: bold; font-size: ${fontSize}px;">Unknown</div>
    <div style="font-size: ${fontSize - 2}px; margin-top: 2px;">Unknown</div>
  `;

  // Get titles if any
  const titles = dog.titles ? (Array.isArray(dog.titles) ? dog.titles.join(', ') : dog.titles) : '';

  // For the last column (3rd generation), only show name and registration number
  if (isLastColumn) {
    return `
      <div style="font-weight: bold; font-size: ${fontSize}px;">${(dog.name || 'Unknown').toUpperCase()}</div>
      <div style="font-size: ${fontSize - 2}px; margin-top: 2px;">${(dog.registrationNumber || 'Unknown').toUpperCase()}</div>
    `;
  }
  
  // For German Shepherd Dogs, only show name, registration number, and titles
  if (isGermanShepherd(dog)) {
    return `
      <div style="font-weight: bold; font-size: ${fontSize}px;">${(dog.name || 'Unknown').toUpperCase()}</div>
      <div style="font-size: ${fontSize - 2}px; margin-top: 2px;">${(dog.registrationNumber || 'Unknown').toUpperCase()}</div>
      ${titles ? `<div style="font-size: ${fontSize - 3}px; margin-top: 1px;">${titles.toUpperCase()}</div>` : ''}
    `;
  }

  // For other breeds, show all details
  return `
    <div style="font-weight: bold; font-size: ${fontSize}px;">${(dog.name || 'Unknown').toUpperCase()}</div>
    <div style="font-size: ${fontSize - 2}px; margin-top: 2px;">${(dog.registrationNumber || 'Unknown').toUpperCase()}</div>
    <div style="font-size: ${fontSize - 3}px; margin-top: 1px;">${(dog.breedObj?.name || dog.breed || 'Unknown').toUpperCase()}</div>
    ${dog.dateOfBirth ? `<div style="font-size: ${fontSize - 3}px; margin-top: 1px;">DOB: ${formatDate(dog.dateOfBirth).toUpperCase()}</div>` : ''}
    ${dog.color ? `<div style="font-size: ${fontSize - 3}px; margin-top: 1px;">COLOR: ${(dog.color || 'Unknown').toUpperCase()}</div>` : ''}
    ${titles ? `<div style="font-size: ${fontSize - 3}px; margin-top: 1px;">${titles.toUpperCase()}</div>` : ''}
  `;
}

/**
 * Extract the 4th generation dogs from the pedigree data
 * @param dog The main dog to extract 4th generation ancestors from
 */
function extractFourthGeneration(dog: DogNode): FourthGeneration {
  return {
    sireSireSire: dog?.sire?.sire?.sire || null,
    sireSireDam: dog?.sire?.sire?.dam || null,
    sireDamSire: dog?.sire?.dam?.sire || null,
    sireDamDam: dog?.sire?.dam?.dam || null,
    damSireSire: dog?.dam?.sire?.sire || null,
    damSireDam: dog?.dam?.sire?.dam || null,
    damDamSire: dog?.dam?.dam?.sire || null,
    damDamDam: dog?.dam?.dam?.dam || null,
  };
}

/**
 * Generate an FCI standard pedigree certificate PDF
 * @param options Certificate options and dog data
 * @returns Promise that resolves with the PDF blob
 */
export const generatePedigreeCertificate = async (
  options: PedigreeCertificateOptions
): Promise<Blob> => {
  // Debug logging
  console.log('PDF Generator options:', options);
  console.log('isExportCertificate flag:', options.isExportCertificate);
  console.log('isFciCertificate flag:', options.isFciCertificate);
  
  // Ensure mutual exclusivity between Export and FCI certificate options
  // If both are true, prioritize FCI over Export
  if (options.isExportCertificate && options.isFciCertificate) {
    console.log('Both certificate flags are true, prioritizing FCI certificate');
    options.isExportCertificate = false;
  }
  // Create a container to hold the certificate HTML
  const container = document.createElement('div');
  container.style.width = '1122px'; // A4 Landscape width at 96 DPI
  container.style.height = '795px'; // A4 Landscape height at 96 DPI
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.fontFamily = options.fontFamily || 'Arial, sans-serif';
  
  // Handle both formats: full dog object or individual properties
  let dog: DogNode;
  
  // If a full dog object is provided, use it but ensure all required properties exist
  if (options.dog) {
    dog = {
      // Ensure id is always defined, even if it's an empty string
      id: options.dog?.id || '',
      name: options.dog.name || 'Unknown',
      // Handle both breed structures (string or object with name)
      breed: options.dog.breedObj?.name || options.dog.breed || 'Unknown',
      breedObj: options.dog.breedObj || undefined,
      gender: options.dog.gender || 'Unknown',
      dateOfBirth: options.dog.dateOfBirth || undefined,
      dateOfDeath: options.dog.dateOfDeath || undefined,
      registrationNumber: options.dog.registrationNumber || 'Unknown',
      microchipNumber: options.dog.microchipNumber || 'Unknown', // Add microchip number
      color: options.dog.color || 'Unknown',
      isChampion: typeof options.dog.isChampion === 'boolean' ? options.dog.isChampion : false,
      healthTested: typeof options.dog.healthTested === 'boolean' ? options.dog.healthTested : false,
      ownerId: options.dog.ownerId || '',
      sire: options.dog.sire || null,
      dam: options.dog.dam || null
    };
  } else {
    // Otherwise, construct a dog object from individual properties
    dog = {
      // Use an empty string as fallback for id to prevent null reference errors
      id: options.dogId || '',
      name: options.dogName || 'Unknown',
      breed: options.breed || 'Unknown',
      gender: options.gender || 'Unknown',
      dateOfBirth: options.dateOfBirth || undefined,
      dateOfDeath: options.dateOfDeath || undefined,
      registrationNumber: options.registrationNumber || 'Unknown',
      microchipNumber: options.microchipNumber || 'Unknown', // Add microchip number
      color: options.color || 'Unknown',
      isChampion: typeof options.isChampion === 'boolean' ? options.isChampion : false,
      healthTested: typeof options.healthTested === 'boolean' ? options.healthTested : false,
      ownerId: options.ownerId || ''
    };
  }
  
  // Extract parent data
  const sire = dog.sire || null;
  const dam = dog.dam || null;
  
  // Extract 4th generation data - create a temporary dog object with sire and dam
  const tempDog: DogNode = {
    id: dog.id,
    name: dog.name,
    sire: sire,
    dam: dam,
    breed: dog.breedObj?.name || dog.breed,
    gender: dog.gender
  };
  const fourthGen = extractFourthGeneration(tempDog);
  
  // Generate HTML for the certificate matching the Kennel Union of Ghana layout
  container.innerHTML = `
    <div style="width: 100%; height: 100%; box-sizing: border-box; position: relative; padding: 0; font-family: ${options.fontFamily || 'Arial, sans-serif'}; page-break-after: always;">
      <!-- KUG Logo Watermark -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; opacity: 0.05;">
        <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/kug_kogo.png" style="width: 1365px; height: auto;" alt="KUG Watermark" />
      </div>
      
      <!-- Gye-Nyame Repeating Background Pattern -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; opacity: 0.02; pointer-events: none;">
        <div style="width: 100%; height: 100%; background-image: url(${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/gye-nyame.png); background-size: 40px auto; background-repeat: repeat; opacity: 0.025;"></div>
      </div>
      <!-- Ghana Colors Top Border -->
      <div style="display: flex; flex-direction: column;">
        <div style="height: 4px; background-color: red;"></div>
        <div style="height: 4px; background-color: yellow;"></div>
        <div style="height: 4px; background-color: green;"></div>
      </div>
      
      <!-- Header with Logos and Title -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px;">
        <div style="width: 33%; position: relative;">
          <div style="text-align: left;">
            <div style="font-size: 12px;">info@kennelunionofghana.com</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 5px; height: 20px;">
              ${options.isExportCertificate === true ? '<span style="color: #d50032;">EXPORT PEDIGREE</span>' : ''}
            </div>
          </div>
          
          <!-- FCI Logo for both FCI and Export certificates, KUG logo for standard -->
          <div style="display: flex; flex-direction: column; align-items: center; position: absolute; right: 15px; top: -10px;">
            ${options.isFciCertificate === true || options.isExportCertificate === true ? 
              `<img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/fci_logo.png" style="width: 60px; height: 60px;" alt="FCI Logo" />
               <div style="font-size: 10px; margin-top: 1px;">CONTRACT PARTNER</div>` : 
              `<img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/kug_kogo.png" style="width: 80px; height: 80px; margin-top: -8px;" alt="KUG Logo" />
               <div style="font-size: 10px; margin-top: 21px; visibility: hidden;">SPACER</div>`
            }
          </div>
        </div>
        
        <div style="text-align: center; width: 33%;">
          <h1 style="margin: 0; font-size: 18px; font-weight: bold;">KENNEL UNION OF GHANA</h1>
          <h2 style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">CERTIFIED PEDIGREE</h2>
        </div>
        
        <div style="text-align: right; width: 33%; position: relative;">
          <div style="font-size: 12px;">www.kennelunionofghana.com</div>
          <!-- Kennel Union Logo -->
          <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/kug_kogo.png" style="position: absolute; left: 30px; top: -10px; width: 80px; height: 80px;" alt="KUG Logo" />
          <div style="font-size: 14px; font-weight: bold; margin-top: 25px;">${options.isExportCertificate === true ? 'EX ' : ''}${dog.registrationNumber || '0000001'}</div>
        </div>
      </div>
      
      <!-- Dog Information Box -->
      <div style="background-color: #d6f5d6; padding: 10px 15px; margin: 10px 15px; display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto auto auto; gap: 8px 15px;">
        <div><strong>NAME</strong> ${(dog.name || 'Unknown').toUpperCase()}</div>
        <div><strong>PEDIGREE NO</strong> ${(dog.registrationNumber || 'Unknown').toUpperCase()}</div>
        <div><strong>MICROCHIP</strong> ${dog.microchipNumber ? dog.microchipNumber.substring(0, 15).toUpperCase() + (dog.microchipNumber.length > 15 ? '...' : '') : 'UNKNOWN'}</div>
        
        <div><strong>BREED</strong> ${(dog.breedObj?.name || dog.breed || 'Unknown').toUpperCase()}</div>
        <div><strong>SEX</strong> ${(dog.gender || 'Unknown').toUpperCase()}</div>
        <div><strong>COLOR</strong> ${(dog.color || 'Unknown').toUpperCase()}</div>
        
        <div><strong>DATE OF BIRTH</strong> ${formatDate(dog.dateOfBirth).toUpperCase()}</div>
        <div><strong>COAT</strong> ${(options.coat || 'Standard').toUpperCase()}</div>
        <div><strong>BREEDER</strong> ${(options.dog?.user ? `${options.dog.user.firstName || ''} ${options.dog.user.lastName || ''}` : options.breederName || 'Unknown').toUpperCase()}</div>
      </div>

      <!-- Pedigree Table with Generation-based columns (2-4-8) -->
      <div style="margin: 0 15px;">

        
        <!-- Pedigree Table Structure -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #999;">
          <tr>
            <!-- Gen 1: Sire (spans 4 rows) -->
            <td rowspan="4" style="width: 14.28%; border: 1px solid #999; background-color: #d6f5d6; padding: 8px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.sire, 14)}
            </td>
            
            <!-- Gen 2: Sire's Sire (spans 2 rows) -->
            <td rowspan="2" style="width: 14.28%; border: 1px solid #999; background-color: #ffffff; padding: 8px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.sire?.sire, 13)}
            </td>
            
            <!-- Gen 3: Sire's Sire's Sire -->
            <td style="width: 14.28%; border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.sire?.sire?.sire, 12, true)}
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Sire's Sire's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.sire?.sire?.dam, 12, true)}
            </td>
          </tr>
          
          <tr>
            <!-- Gen 2: Sire's Dam (spans 2 rows) -->
            <td rowspan="2" style="border: 1px solid #999; background-color: #d6f5d6; padding: 8px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.sire?.dam, 13)}
            </td>
            
            <!-- Gen 3: Sire's Dam's Sire -->
            <td style="border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.sire?.dam?.sire, 12, true)}
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Sire's Dam's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.sire?.dam?.dam, 12, true)}
            </td>
          </tr>
          
          <tr>
            <!-- Gen 1: Dam (spans 4 rows) -->
            <td rowspan="4" style="border: 1px solid #999; background-color: #ffffff; padding: 8px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.dam, 14)}
            </td>
            
            <!-- Gen 2: Dam's Sire (spans 2 rows) -->
            <td rowspan="2" style="border: 1px solid #999; background-color: #d6f5d6; padding: 8px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.dam?.sire, 13)}
            </td>
            
            <!-- Gen 3: Dam's Sire's Sire -->
            <td style="border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.dam?.sire?.sire, 12, true)}
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Dam's Sire's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.dam?.sire?.dam, 12, true)}
            </td>
          </tr>
          
          <tr>
            <!-- Gen 2: Dam's Dam (spans 2 rows) -->
            <td rowspan="2" style="border: 1px solid #999; background-color: #ffffff; padding: 8px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.dam?.dam, 13)}
            </td>
            
            <!-- Gen 3: Dam's Dam's Sire -->
            <td style="border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.dam?.dam?.sire, 12, true)}
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Dam's Dam's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              ${getDogCellContent(dog.dam?.dam?.dam, 12, true)}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Certificate Footer - Transfer of Ownership Information -->
      <div style="margin: 10px 15px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="width: 20%; text-align: center;">
          <div style=" margin-bottom: 5px; height: 20px;">
            ${options.certificateDate ? formatDate(options.certificateDate) : ''}
          </div>
          <div style="text-align: center; font-size: 12px;">Transfer of ownership date</div>
        </div>
        
        <div style="width: 25%; text-align: center;">
          <div style=" margin-bottom: 5px; height: 20px;">
            ${options.newOwnerName || ''}
          </div>
          <div style="text-align: center; font-size: 12px;">New Owner Name</div>
        </div>
        
        <div style="width: 25%; text-align: center;">
          <div style="margin-bottom: 5px; height: 20px;">
            ${options.newOwnerAddress || ''}
          </div>
          <div style="text-align: center; font-size: 12px;">New Owner Address</div>
        </div>
        
        <div style="width: 20%; text-align: center;">
          <div style="margin-bottom: 5px; height: 50px;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/signature.png" alt="Signature" style="max-height: 50px; max-width: 100%; object-fit: contain;" />
          </div>
          <div style="text-align: center; font-size: 12px;">Signature</div>
        </div>
      </div>
      
      <!-- Certification Text -->
      <div style="margin: 20px 15px 10px 15px; font-size: 11px; font-style: italic;">
        I <strong>SAMIR MSAILEB</strong>, the guardian of the KUG stud book, certify that the above information is correct and reliable. ${formatDate(options.certificateDate || new Date())}
      </div>
      
      <!-- Some spacing before the bottom border -->
      <div style="margin-top: 20px;"></div>
      
      <!-- Ghana Colors Bottom Border - Moved to the absolute bottom -->
      <div style="display: flex; flex-direction: column; margin: 5px 0 0 0; position: absolute; bottom: 0; left: 0; right: 0;">
        <div style="height: 4px; background-color: red;"></div>
        <div style="height: 4px; background-color: yellow;"></div>
        <div style="height: 4px; background-color: green;"></div>
      </div>
    </div>
  `;
  
  // Add the container to the document body
  document.body.appendChild(container);
  
  try {
    // Convert the HTML to a canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from different domains
      logging: false
    });
    
    // Create PDF from canvas - using landscape orientation
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Generate PDF blob
    const blob = pdf.output('blob');
    return blob;
  } finally {
    // Clean up - remove the temporary container
    document.body.removeChild(container);
  }
};

/**
 * Generate and download a pedigree certificate as PDF
 */
export const downloadPedigreeCertificate = async (options: PedigreeCertificateOptions): Promise<void> => {
  try {
    // Pass all options to the PDF generator
    // This ensures that options like isExportCertificate are properly forwarded
    const blob = await generatePedigreeCertificate(options);
    
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // Get the dog name safely for the filename
    let dogName = 'Unknown';
    if (options.dog && options.dog.name) {
      dogName = options.dog.name;
    } else if (options.dogName) {
      dogName = options.dogName;
    }
    link.download = `${dogName.replace(/\s+/g, '_')}_FCI_Pedigree_Certificate.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

/**
 * Helper function to format dates consistently throughout the application
 * Handles various date formats and invalid/missing values
 */
export const formatDate = (dateString?: string | Date | null): string => {
  // Handle null, undefined, or empty string cases
  if (!dateString) return 'UNKNOWN';
  
  try {
    // Handle timestamp strings
    if (typeof dateString === 'string' && !isNaN(Number(dateString))) {
      const timestamp = Number(dateString);
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '/');
      }
    }
    
    // If already a Date object, use it directly
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format received: ${dateString}`);
      return typeof dateString === 'string' ? dateString.toUpperCase() : 'INVALID DATE';
    }
    
    // Format the date consistently
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/').toUpperCase();
  } catch (error) {
    console.warn(`Error formatting date: ${dateString}`, error);
    return typeof dateString === 'string' ? dateString.toUpperCase() : 'INVALID DATE';
  }
};
