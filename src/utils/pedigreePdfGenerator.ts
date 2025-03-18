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
  size?: string;
  ownerName?: string;
  ownerAddress?: string;
  
  // Style options
  primaryColor?: string;
  secondaryColor?: string;
  
  // Certificate type options
  isExportCertificate?: boolean;
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
          
          <!-- FCI Logo with Contract Partner -->
          <div style="display: flex; flex-direction: column; align-items: center; position: absolute; right: 15px; top: -10px;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/fci_logo.png" style="width: 60px; height: 60px;" alt="FCI Logo" />
            <div style="font-size: 10px; margin-top: 1px;">Contract Partner</div>
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
        <div><strong>Name</strong> ${dog.name || 'Unknown'}</div>
        <div><strong>Pedigree No</strong> ${dog.registrationNumber || 'Unknown'}</div>
        <div><strong>Microchip</strong> ${dog.microchipNumber ? dog.microchipNumber.substring(0, 15) + (dog.microchipNumber.length > 15 ? '...' : '') : 'Unknown'}</div>
        
        <div><strong>Breed</strong> ${dog.breedObj?.name || dog.breed || 'Unknown'}</div>
        <div><strong>Sex</strong> ${dog.gender || 'Unknown'}</div>
        <div><strong>Color</strong> ${dog.color || 'Unknown'}</div>
        
        <div><strong>Date of birth</strong> ${formatDate(dog.dateOfBirth)}</div>
        <div><strong>Coat</strong> ${options.coat || 'Standard'}</div>
        <div><strong>Size</strong> ${options.size || 'Medium'}</div>
      </div>

      <!-- Pedigree Table with Generation-based columns (2-4-8) -->
      <div style="margin: 0 15px;">

        
        <!-- Pedigree Table Structure -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #999;">
          <tr>
            <!-- Gen 1: Sire (spans 4 rows) -->
            <td rowspan="4" style="width: 14.28%; border: 1px solid #999; background-color: #d6f5d6; padding: 8px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 14px;">${dog.sire?.name || 'Unknown'}</div>
              <div style="font-size: 12px; margin-top: 4px;">${dog.sire?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">${dog.sire?.breedObj?.name || dog.sire?.breed || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">DOB: ${formatDate(dog.sire?.dateOfBirth)}</div>
              <div style="font-size: 11px; margin-top: 3px;">Color: ${dog.sire?.color || 'Unknown'}</div>
            </td>
            
            <!-- Gen 2: Sire's Sire (spans 2 rows) -->
            <td rowspan="2" style="width: 14.28%; border: 1px solid #999; background-color: #ffffff; padding: 8px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">${dog.sire?.sire?.name || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">${dog.sire?.sire?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.sire?.sire?.breedObj?.name || dog.sire?.sire?.breed || 'Unknown'}</div>
            </td>
            
            <!-- Gen 3: Sire's Sire's Sire -->
            <td style="width: 14.28%; border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.sire?.sire?.sire?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.sire?.sire?.sire?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.sire?.sire?.sire?.breedObj?.name || dog.sire?.sire?.sire?.breed || 'Unknown'}</div>
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Sire's Sire's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.sire?.sire?.dam?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.sire?.sire?.dam?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.sire?.sire?.dam?.breedObj?.name || dog.sire?.sire?.dam?.breed || 'Unknown'}</div>
            </td>
          </tr>
          
          <tr>
            <!-- Gen 2: Sire's Dam (spans 2 rows) -->
            <td rowspan="2" style="border: 1px solid #999; background-color: #d6f5d6; padding: 8px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">${dog.sire?.dam?.name || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">${dog.sire?.dam?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.sire?.dam?.breedObj?.name || dog.sire?.dam?.breed || 'Unknown'}</div>
            </td>
            
            <!-- Gen 3: Sire's Dam's Sire -->
            <td style="border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.sire?.dam?.sire?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.sire?.dam?.sire?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.sire?.dam?.sire?.breedObj?.name || dog.sire?.dam?.sire?.breed || 'Unknown'}</div>
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Sire's Dam's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.sire?.dam?.dam?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.sire?.dam?.dam?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.sire?.dam?.dam?.breedObj?.name || dog.sire?.dam?.dam?.breed || 'Unknown'}</div>
            </td>
          </tr>
          
          <tr>
            <!-- Gen 1: Dam (spans 4 rows) -->
            <td rowspan="4" style="border: 1px solid #999; background-color: #ffffff; padding: 8px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 14px;">${dog.dam?.name || 'Unknown'}</div>
              <div style="font-size: 12px; margin-top: 4px;">${dog.dam?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">${dog.dam?.breedObj?.name || dog.dam?.breed || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">DOB: ${formatDate(dog.dam?.dateOfBirth)}</div>
              <div style="font-size: 11px; margin-top: 3px;">Color: ${dog.dam?.color || 'Unknown'}</div>
            </td>
            
            <!-- Gen 2: Dam's Sire (spans 2 rows) -->
            <td rowspan="2" style="border: 1px solid #999; background-color: #d6f5d6; padding: 8px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">${dog.dam?.sire?.name || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">${dog.dam?.sire?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.dam?.sire?.breedObj?.name || dog.dam?.sire?.breed || 'Unknown'}</div>
            </td>
            
            <!-- Gen 3: Dam's Sire's Sire -->
            <td style="border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.dam?.sire?.sire?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.dam?.sire?.sire?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.dam?.sire?.sire?.breedObj?.name || dog.dam?.sire?.sire?.breed || 'Unknown'}</div>
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Dam's Sire's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.dam?.sire?.dam?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.dam?.sire?.dam?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.dam?.sire?.dam?.breedObj?.name || dog.dam?.sire?.dam?.breed || 'Unknown'}</div>
            </td>
          </tr>
          
          <tr>
            <!-- Gen 2: Dam's Dam (spans 2 rows) -->
            <td rowspan="2" style="border: 1px solid #999; background-color: #ffffff; padding: 8px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">${dog.dam?.dam?.name || 'Unknown'}</div>
              <div style="font-size: 11px; margin-top: 3px;">${dog.dam?.dam?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.dam?.dam?.breedObj?.name || dog.dam?.dam?.breed || 'Unknown'}</div>
            </td>
            
            <!-- Gen 3: Dam's Dam's Sire -->
            <td style="border: 1px solid #999; background-color: #d6f5d6; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.dam?.dam?.sire?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.dam?.dam?.sire?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.dam?.dam?.sire?.breedObj?.name || dog.dam?.dam?.sire?.breed || 'Unknown'}</div>
            </td>
          </tr>
          
          <tr>
            <!-- Gen 3: Dam's Dam's Dam -->
            <td style="border: 1px solid #999; background-color: #ffffff; padding: 6px; vertical-align: middle; text-align: center;">
              <div style="font-weight: bold; font-size: 12px;">${dog.dam?.dam?.dam?.name || 'Unknown'}</div>
              <div style="font-size: 10px; margin-top: 2px;">${dog.dam?.dam?.dam?.registrationNumber || 'Unknown'}</div>
              <div style="font-size: 9px; margin-top: 1px;">${dog.dam?.dam?.dam?.breedObj?.name || dog.dam?.dam?.dam?.breed || 'Unknown'}</div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Certificate Footer - Transfer of Ownership Information -->
      <div style="margin: 10px 15px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="width: 20%; text-align: center;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 20px;"></div>
          <div style="text-align: center; font-size: 12px;">Transfer of ownership date</div>
        </div>
        
        <div style="width: 25%; text-align: center;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 20px;"></div>
          <div style="text-align: center; font-size: 12px;">New Owner Name</div>
        </div>
        
    
        
        <div style="width: 20%; text-align: center;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 20px;"></div>
          <div style="text-align: center; font-size: 12px;">Signature</div>
        </div>
      </div>
      
      <!-- Certification Text -->
      <div style="margin: 20px 15px 10px 15px; font-size: 11px; font-style: italic;">
        I SAMIR MSAILEB, the guardian of the KUG stud book, certify that the above information is correct and reliable. ${formatDate(options.certificateDate || new Date())}
      </div>
      
      <!-- Ghana Colors Bottom Border - Moved before additional info -->
      <div style="display: flex; flex-direction: column; margin: 5px 0 0 0;">
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
  if (!dateString) return 'Unknown';
  
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
      return typeof dateString === 'string' ? dateString : 'Invalid date';
    }
    
    // Format the date consistently
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  } catch (error) {
    console.warn(`Error formatting date: ${dateString}`, error);
    return typeof dateString === 'string' ? dateString : 'Invalid date';
  }
};
