import { DogNode } from './pedigreeFormatters';

/**
 * Formats a date string in a user-friendly format
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (error) {
    return dateString || "N/A";
  }
}

/**
 * Generate the certificate header HTML
 */
export function generateCertificateHeader(dog?: DogNode): string {
  return `
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #e6f2ff; border-bottom: 1px solid #99c2ff; padding: 12px 20px;">
      <div style="display: flex; align-items: center;">
        <div style="border: 2px solid #0066b3; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px; background-color: white;">
          <span style="font-size: 12px; color: #0066b3; font-weight: bold;">FCI</span>
        </div>
        <div>
          <div style="font-size: 12px; color: #0066b3;">Ime:</div>
          <div style="font-size: 18px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">${dog?.name || 'Unknown'}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; margin-left: auto;">
        <div style="margin-right: 15px; text-align: right;">
          <div style="font-size: 20px; font-weight: bold; color: #0066b3;">JR</div>
          <div style="font-size: 16px; font-weight: bold;">${dog?.registrationNumber || 'N/A'}</div>
        </div>
        <div style="border: 2px solid #0066b3; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background-color: white;">
          <span style="font-size: 12px; color: #0066b3; font-weight: bold;">KSS</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate the dog details section HTML
 */
export function generateDogDetails(dog?: DogNode): string {
  return `
    <!-- Dog Details -->
    <div style="display: grid; grid-template-columns: 20% 40% 20% 20%; border-bottom: 1px solid #99c2ff;">
      <div style="padding: 8px; border-right: 1px solid #99c2ff; background-color: #e6f2ff;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 3px;">Rasa:</div>
        <div style="font-size: 12px; font-weight: bold;">Breed:</div>
      </div>
      <div style="padding: 8px; border-right: 1px solid #99c2ff; font-weight: bold; font-size: 14px; display: flex; align-items: center; text-transform: uppercase;">
        ${dog?.breed?.toUpperCase() || 'UNKNOWN BREED'}
      </div>
      <div style="padding: 8px; border-right: 1px solid #99c2ff; display: flex; justify-content: center; align-items: center;">
        <span style="font-size: 28px; font-weight: bold; color: #d50032; letter-spacing: 1px;">EXPORT</span>
      </div>
      <div style="padding: 8px;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 3px;">Oštenjeno:</div>
        <div style="font-size: 12px; font-weight: bold;">Date of birth:</div>
        <div style="font-size: 14px; margin-top: 5px;">${formatDate(dog?.dateOfBirth) || 'Unknown'}</div>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 20% 40% 40%; border-bottom: 1px solid #99c2ff;">
      <div style="padding: 8px; border-right: 1px solid #99c2ff; background-color: #e6f2ff;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 3px;">Boja:</div>
        <div style="font-size: 12px; font-weight: bold;">Colour:</div>
      </div>
      <div style="padding: 8px; border-right: 1px solid #99c2ff; font-size: 14px;">
        ${dog?.color || 'Unknown'}
      </div>
      <div style="padding: 8px; display: flex; flex-direction: column;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 3px;">Pol:</div>
        <div style="font-size: 12px; font-weight: bold;">Sex:</div>
        <div style="font-size: 14px; margin-top: 5px; text-transform: lowercase;">${dog?.gender?.toLowerCase() || 'unknown'}</div>
      </div>
    </div>
  `;
}

/**
 * Generate the breeder section HTML
 */
export function generateBreederSection(breederName?: string): string {
  return `
    <div style="display: grid; grid-template-columns: 20% 80%; border-bottom: 1px solid #99c2ff;">
      <div style="padding: 8px; border-right: 1px solid #99c2ff; background-color: #e6f2ff;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 3px;">Odgajivač:</div>
        <div style="font-size: 12px; font-weight: bold;">Breeder:</div>
      </div>
      <div style="padding: 8px; font-size: 14px;">
        ${breederName || 'Unknown'}
      </div>
    </div>
  `;
}

/**
 * Generate a parent section (Sire or Dam)
 */
export function generateParentSection(
  parent?: DogNode | null, 
  isSire = true, 
  backgroundColor = 'transparent'
): string {
  const parentType = isSire ? 'OTAC - SIRE' : 'MAJKA - DAM';
  
  return `
    <div style="padding: 8px; border-right: 1px solid #99c2ff; ${isSire ? 'border-bottom: 1px solid #99c2ff;' : ''} grid-row: span ${isSire ? '7' : '9'}; grid-column: 1; background-color: ${backgroundColor};">
      <div style="font-weight: bold; color: #0066b3; margin-bottom: 5px;">${parentType}</div>
      <div style="font-weight: bold; font-size: 14px; text-transform: uppercase;">${parent?.name || 'Unknown'}</div>
      <div style="font-size: 12px; margin-top: 5px;">
        ${parent?.registrationNumber ? `JR ${parent?.registrationNumber} No` : ''}
      </div>
      ${parent?.dateOfBirth ? 
        `<div style="font-size: 11px; margin-top: 8px; color: #555;">
          <div>Upisan:</div>
          <div style="font-weight: bold;">JR ${parent?.registrationNumber} No</div>
          <div style="margin-top: 5px;">Oštenjeno:</div>
          <div style="font-weight: bold;">${formatDate(parent?.dateOfBirth)}</div>
         </div>` : ''}
    </div>
  `;
}

/**
 * Generate a grandparent section (Sire's Sire, Sire's Dam, Dam's Sire, or Dam's Dam)
 */
export function generateGrandparentSection(
  grandparent?: DogNode | null, 
  isPaternal = true, 
  isMale = true,
  backgroundColor = 'transparent'
): string {
  const prefix = isPaternal ? 'SZ' : 'JR';
  
  return `
    <div style="padding: 8px; border-right: 1px solid #99c2ff; ${isPaternal ? 'border-bottom: 1px solid #99c2ff;' : ''} grid-row: span ${isMale ? '3' : '4'}; grid-column: 2; background-color: ${backgroundColor};">
      <div style="font-weight: bold; font-size: 13px; text-transform: uppercase;">${grandparent?.name || 'Unknown'}</div>
      <div style="font-size: 11px; margin-top: 3px;">
        ${grandparent?.registrationNumber ? `${prefix} ${grandparent?.registrationNumber}${!isPaternal ? ' No' : ''}` : ''}
      </div>
      <div style="font-size: 10px; margin-top: 5px; color: #555;">
        ${grandparent?.dateOfBirth ? `OSt: ${formatDate(grandparent?.dateOfBirth)}` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate a fourth-generation ancestor section
 */
export function generateAncestorSection(
  ancestor?: DogNode | null,
  prefix = 'JR',
  showNo = true,
  backgroundColor = 'transparent',
  hasBorderBottom = true
): string {
  return `
    <div style="padding: 8px; border-right: 1px solid #99c2ff; ${hasBorderBottom ? 'border-bottom: 1px solid #99c2ff;' : ''} grid-row: span 2; grid-column: 3; background-color: ${backgroundColor};">
      <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">${ancestor?.name || 'Unknown'}</div>
      <div style="font-size: 10px; color: #555;">
        ${ancestor?.registrationNumber ? `${prefix} ${ancestor?.registrationNumber}${showNo ? ' No' : ''}` : ''}
      </div>
    </div>
  `;
}

/**
 * Generate the fourth generation grid for the right side of the pedigree chart
 */
export function generateFourthGenerationGrid(fourthGen: Record<string, DogNode | null>): string {
  return `
    <div style="display: grid; grid-template-rows: repeat(16, 1fr); height: 100%;">
      ${[...Array(8)].map((_, i) => {
        // Map index to a dog in fourth generation
        const positions = [
          'sireSireSire', 'sireSireDam', 
          'sireDamSire', 'sireDamDam',
          'damSireSire', 'damSireDam', 
          'damDamSire', 'damDamDam'
        ] as const;
        
        const position = positions[i];
        const dog = position ? fourthGen[position] : null;
        
        return `
          <div style="padding: 6px; border-bottom: ${i < 7 ? '1px solid #99c2ff' : 'none'}; height: 100%; font-size: 11px; overflow: hidden;">
            <div style="font-weight: bold; text-transform: uppercase;">${dog?.name || 'Unknown'}</div>
            <div style="font-size: 9px; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${dog?.registrationNumber ? 
                `${['sireSireSire', 'sireSireDam', 'sireDamSire', 'sireDamDam'].includes(position) ? 'SZ' : 'JR'} ${dog?.registrationNumber}` 
                : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Generate the certification section at the bottom of the pedigree
 */
export function generateCertificationSection(date?: string): string {
  return `
    <!-- Certificate Signatures and Stamps -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 10px;">
      <div style="padding: 10px; text-align: center;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 15px;">Datum:</div>
        <div style="font-size: 14px; font-weight: bold;">${date || new Date().toLocaleDateString('en-GB')}</div>
      </div>
      <div style="padding: 10px; text-align: center; border-left: 1px solid #99c2ff; border-right: 1px solid #99c2ff;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 5px;">Potpis:</div>
        <div style="font-size: 14px; margin-top: 15px; color: #0066b3;">_______________________</div>
      </div>
      <div style="padding: 10px; text-align: center;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 5px;">Službeni pečat:</div>
        <div style="width: 50px; height: 50px; margin: 5px auto; border: 1px dashed #0066b3; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 8px; color: #0066b3;">Stamp</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generate the dog identification section
 */
export function generateDogIdentificationSection(dog?: DogNode): string {
  return `
    <!-- Dog Identification -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 10px; border-top: 1px solid #99c2ff; border-bottom: 1px solid #99c2ff;">
      <div style="padding: 10px; text-align: center;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 5px;">Broj rodovnika / Pedigree N°:</div>
        <div style="font-size: 14px; font-weight: bold;">JR ${dog?.registrationNumber || 'N/A'}</div>
      </div>
      <div style="padding: 10px; text-align: center; border-left: 1px solid #99c2ff; border-right: 1px solid #99c2ff;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 5px;">Tetovir broj / Tatoο N°:</div>
        <div style="font-size: 14px; font-weight: bold;">${(dog?.id && typeof dog.id === 'string') ? dog.id.substring(0, 6) : 'N/A'}</div>
      </div>
      <div style="padding: 10px; text-align: center;">
        <div style="font-size: 12px; color: #0066b3; margin-bottom: 5px;">Chip:</div>
        <div style="font-size: 14px; font-weight: bold;">${dog?.id || 'N/A'}</div>
      </div>
    </div>
  `;
}

/**
 * Generate the certificate footer
 */
export function generateCertificateFooter(dog?: DogNode): string {
  return `
    <!-- Certificate Verification -->
    <div style="padding: 10px; text-align: center; margin-top: 5px;">
      <div style="font-size: 10px; color: #666;">
        ${new Date().toLocaleDateString()} • Certificate ${dog?.registrationNumber || ''} • ${dog?.name || ''}
      </div>
    </div>
  `;
}
