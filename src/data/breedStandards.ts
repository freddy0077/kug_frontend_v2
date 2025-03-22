// Comprehensive list of AKC-recognized dog breeds with standard information
// This is a simplified version - in production, this would be fetched from an API

export interface BreedStandardCategory {
  title: string;
  content: string;
}

export interface BreedStandard {
  id: string;
  breed: string;
  organization: string;
  description: string;
  link: string;
  categories: BreedStandardCategory[];
}

// Full list of AKC-recognized breeds with basic information
const breedStandards: BreedStandard[] = [
  // Sporting Group
  {
    id: '1',
    breed: 'Labrador Retriever',
    organization: 'American Kennel Club (AKC)',
    description: 'The Labrador Retriever is a medium-large gun dog with a reputation as a friendly and versatile hunting companion.',
    link: 'https://www.akc.org/dog-breeds/labrador-retriever/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Labrador Retriever is a strongly built, medium-sized, short-coupled, dog possessing a sound, athletic, well-balanced conformation that enables it to function as a retrieving gun dog.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 22.5 to 24.5 inches; Females 21.5 to 23.5 inches. Weight: Males 65-80 pounds; Females 55-70 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is short, straight, and very dense, giving a fairly hard feeling to the hand. The colors of Labrador Retrievers are black, yellow, and chocolate.'
      }
    ]
  },
  {
    id: '2',
    breed: 'Golden Retriever',
    organization: 'American Kennel Club (AKC)',
    description: 'The Golden Retriever is a medium-large gun dog that was bred to retrieve shot waterfowl during hunting and shooting parties.',
    link: 'https://www.akc.org/dog-breeds/golden-retriever/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Golden Retriever is a medium-sized, strongly built breed with a dense, water-repellent wavy or straight outer coat.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 23-24 inches; Females 21.5-22.5 inches. Weight: Males 65-75 pounds; Females 55-65 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is dense and water-repellent with good undercoat. The outer coat can be wavy or straight. The Golden Retriever is a rich, lustrous golden of various shades.'
      }
    ]
  },
  {
    id: '3',
    breed: 'German Shorthaired Pointer',
    organization: 'American Kennel Club (AKC)',
    description: 'The German Shorthaired Pointer is a versatile hunter, an all-purpose gun dog capable of high performance in field and water.',
    link: 'https://www.akc.org/dog-breeds/german-shorthaired-pointer/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The German Shorthaired Pointer is a versatile hunter, an all-purpose gun dog capable of high performance in field and water. The judgement of Shorthairs in the show ring reflects this basic characteristic.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 23-25 inches; Females 21-23 inches. Weight: Males 55-70 pounds; Females 45-60 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is short and thick and feels tough to the hand. It is somewhat longer on the underside of the tail and the back edges of the haunches. The coat is liver, liver and white, liver roan, or liver and white roan.'
      }
    ]
  },
  
  // Working Group
  {
    id: '4',
    breed: 'German Shepherd',
    organization: 'American Kennel Club (AKC)',
    description: 'The German Shepherd is a breed of medium to large-sized working dog that originated in Germany.',
    link: 'https://www.akc.org/dog-breeds/german-shepherd-dog/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The German Shepherd Dog is a medium-sized, slightly elongated, powerful, and well-muscled dog, with a dry and firm overall appearance. Its proportions are extremely important to its function as a versatile working dog.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 24 to 26 inches; Females 22 to 24 inches. Weight: Males 65-90 pounds; Females 50-70 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The ideal German Shepherd has a double coat of medium length. The outer coat should be as dense as possible, hair straight, harsh and lying close to the body. The accepted colors are rich tan to red with black saddle, all black, and sable.'
      }
    ]
  },
  {
    id: '5',
    breed: 'Rottweiler',
    organization: 'American Kennel Club (AKC)',
    description: 'The Rottweiler is a breed of domestic dog, regarded as medium-to-large or large. The dogs were known in German as Rottweiler Metzgerhund, meaning Rottweil butchers dogs.',
    link: 'https://www.akc.org/dog-breeds/rottweiler/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Rottweiler is a robust, powerful and loyal breed. An intelligent, self-confident dog with a straightforward and direct approach to his environment, he exhibits a wait-and-see attitude when confronted with new people and situations.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 24-27 inches; Females 22-25 inches. Weight: Males 95-135 pounds; Females 80-100 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is straight, coarse, dense and of medium length. The outer coat is straight, coarse, dense, of medium length. The undercoat should be present on the neck and thighs. The color is always black with rust to mahogany markings.'
      }
    ]
  },
  {
    id: '6',
    breed: 'Doberman Pinscher',
    organization: 'American Kennel Club (AKC)',
    description: 'The Doberman Pinscher is a medium to large breed of domestic dog originally developed around 1890 by Karl Friedrich Louis Dobermann, a tax collector from Germany.',
    link: 'https://www.akc.org/dog-breeds/doberman-pinscher/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The appearance is that of a dog of medium size, with a body that is square. Compactly built, muscular and powerful, for great endurance and speed. Elegant in appearance, of proud carriage, reflecting great nobility and temperament.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 26-28 inches; Females 24-26 inches. Weight: Males 75-100 pounds; Females 60-90 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is smooth-haired, short, hard, thick and close lying. Allowed colors are black, red, blue, and fawn, each with rust-colored markings on the cheeks, muzzle, throat, chest, legs, feet and below the tail.'
      }
    ]
  },
  
  // Terrier Group
  {
    id: '7',
    breed: 'Yorkshire Terrier',
    organization: 'American Kennel Club (AKC)',
    description: 'The Yorkshire Terrier is a small dog breed of terrier type, developed during the 19th century in Yorkshire, England, to catch rats in clothing mills.',
    link: 'https://www.akc.org/dog-breeds/yorkshire-terrier/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Yorkshire Terrier is a compact, toy-size terrier of no more than seven pounds whose crowning glory is a floor-length, silky coat of steel blue and a rich golden tan.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Weight: Must not exceed 7 pounds. The ideal is 4-7 pounds. The Yorkies stance is confident; the body is compact.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is glossy, fine, and silky in texture. The hair on the body is moderately long and perfectly straight. The hair is steel blue in color, not silver blue, with golden tan markings on the head, chest, and legs.'
      }
    ]
  },
  {
    id: '8',
    breed: 'West Highland White Terrier',
    organization: 'American Kennel Club (AKC)',
    description: 'The West Highland White Terrier, commonly known as the Westie, is a Scottish breed of terrier. It has a distinctive rough white coat with a somewhat soft white undercoat.',
    link: 'https://www.akc.org/dog-breeds/west-highland-white-terrier/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The West Highland White Terrier is a small, game, well-balanced, hardy-looking terrier, exhibiting good showmanship, possessed with self-esteem, strongly built, deep in chest and back ribs, straight back and powerful hindquarters on muscular legs.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: 10-11 inches. Weight: 15-20 pounds. These are ideal weights and heights - slight variations are acceptable.'
      },
      {
        title: 'Coat & Color',
        content: 'Very important and selectively bred for for centuries. Double-coated with the outer coat consisting of hard, straight, white hair, about 2 inches long, with a shorter undercoat. Color is white.'
      }
    ]
  },
  
  // Toy Group
  {
    id: '9',
    breed: 'Shih Tzu',
    organization: 'American Kennel Club (AKC)',
    description: 'The Shih Tzu is a toy dog breed, weighing from 4 to 7.5 kg when fully grown. The breed originated in China.',
    link: 'https://www.akc.org/dog-breeds/shih-tzu/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Shih Tzu is a sturdy, lively, alert toy dog with long flowing double coat. Befitting his noble Chinese ancestry as a highly valued, prized companion and palace pet, the Shih Tzu is proud of bearing, has a distinctively arrogant carriage.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: 9-10.5 inches. Weight: 9-16 pounds. The Shih Tzu is slightly longer than tall.'
      },
      {
        title: 'Coat & Color',
        content: 'Luxurious, double-coated, dense, long, and flowing. All colors are permissible. A white blaze on the forehead and a white tip on the tail are highly prized in parti-colors.'
      }
    ]
  },
  {
    id: '10',
    breed: 'Chihuahua',
    organization: 'American Kennel Club (AKC)',
    description: 'The Chihuahua is a Mexican breed of toy dog. It is named for the Mexican state of Chihuahua and is among the smallest of all dog breeds.',
    link: 'https://www.akc.org/dog-breeds/chihuahua/',
    categories: [
      {
        title: 'General Appearance',
        content: 'A graceful, alert, swift-moving compact little dog with saucy expression, and with terrier-like qualities of temperament.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Weight: Not exceeding 6 pounds. Height: 5-8 inches at the withers. The body is off-square; hence, slightly longer when measured from point of shoulder to point of buttocks than height at the withers.'
      },
      {
        title: 'Coat & Color',
        content: 'Two coat varieties - smooth coat and long coat. Any color - solid, marked or splashed are acceptable. Smooth Coat: Soft, glossy coat, close and smooth. Long Coat: Soft, flat or slightly wavy coat.'
      }
    ]
  },
  
  // Non-Sporting Group
  {
    id: '11',
    breed: 'Bulldog',
    organization: 'American Kennel Club (AKC)',
    description: 'The Bulldog is a medium-sized breed of dog commonly referred to as the English Bulldog or British Bulldog.',
    link: 'https://www.akc.org/dog-breeds/bulldog/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Bulldog has a thick-set, low-swung body, massive short-faced head, wide shoulders and sturdy limbs.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Weight: Males about 50 pounds; Females about 40 pounds. Height at shoulders: 14-15 inches.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is straight, short, flat, close, of fine texture, smooth and glossy. The color can be brindle, white, red, fawn, fallow, piebald.'
      }
    ]
  },
  {
    id: '12',
    breed: 'Poodle (Standard)',
    organization: 'American Kennel Club (AKC)',
    description: 'The Standard Poodle is a breed of dog known for its intelligence and elegant appearance.',
    link: 'https://www.akc.org/dog-breeds/poodle-standard/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Standard Poodle is an active, intelligent, elegant-appearing dog of medium to large size with a distinctive clip.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Over 15 inches at the highest point of the shoulders. Any Standard Poodle 15 inches or less is disqualified. Proportioned to give an impression of balance.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is naturally curly, of even and solid color at the skin. The colors include apricot, black, blue, cream, gray, silver, white, red, silver beige and brown.'
      }
    ]
  },
  
  // Hound Group
  {
    id: '13',
    breed: 'Beagle',
    organization: 'American Kennel Club (AKC)',
    description: 'The Beagle is a breed of small scent hound, similar in appearance to the much larger foxhound. The beagle was developed primarily for hunting hare.',
    link: 'https://www.akc.org/dog-breeds/beagle/',
    categories: [
      {
        title: 'General Appearance',
        content: 'A miniature Foxhound, solid and big for his inches, with the wear-and-tear look of the hound that can last in the chase and follow his quarry to the death.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Two varieties: under 13 inches (classified as "13-inch") and 13-15 inches (classified as "15-inch"). Weight: 20-30 pounds, depending on height.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is of medium length, close, hard and may be any recognized hound color. The accepted colors are: Tri-color (black, white and tan); Red and White; and Lemon and White.'
      }
    ]
  },
  {
    id: '14',
    breed: 'Dachshund',
    organization: 'American Kennel Club (AKC)',
    description: 'The Dachshund is a short-legged, long-bodied, hound-type dog breed. The standard sized dachshund was developed to scent, chase, and flush out badgers and other burrow-dwelling animals.',
    link: 'https://www.akc.org/dog-breeds/dachshund/',
    categories: [
      {
        title: 'General Appearance',
        content: 'Low to ground, long in body and short of leg, with robust muscular development; the skin is elastic and pliable without excessive wrinkling.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Miniature: 11 pounds and under at 12 months or older. Standard: over 11 pounds to no more than 32 pounds at 12 months or older.'
      },
      {
        title: 'Coat & Color',
        content: 'Three coat varieties: Smooth, Wirehaired, and Longhaired. The Smooth has short, shining hair; the Wirehaired has a uniform tight, short, thick, rough coat; the Longhaired has sleek, glistening, often slightly wavy hair. Colors can be solid, bi-color, or dappled.'
      }
    ]
  },
  
  // Herding Group
  {
    id: '15',
    breed: 'Australian Shepherd',
    organization: 'American Kennel Club (AKC)',
    description: 'The Australian Shepherd is a medium-sized breed of dog that was developed on ranches in the western United States.',
    link: 'https://www.akc.org/dog-breeds/australian-shepherd/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Australian Shepherd is an intelligent, active dog with an even disposition; he is good-natured, seldom quarrelsome. He may be somewhat reserved in initial meetings.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 20-23 inches; Females 18-21 inches. Weight: 40-65 pounds. The Australian Shepherd is slightly longer than tall, with bone that is moderate and clean.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is of medium texture, straight to slightly wavy, weather resistant, of moderate length. The recognized colors are blue merle, red merle, black, and red, all with or without white markings and/or tan points.'
      }
    ]
  },
  {
    id: '16',
    breed: 'Border Collie',
    organization: 'American Kennel Club (AKC)',
    description: 'The Border Collie is a working and herding dog breed. They are descended from landrace collies, a type found widely in the British Isles.',
    link: 'https://www.akc.org/dog-breeds/border-collie/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Border Collie is a well balanced, medium-sized dog of athletic appearance, displaying style and agility in equal measure with soundness and strength.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 19-22 inches; Females 18-21 inches. Weight: Males 30-45 pounds; Females 27-42 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'Two varieties: rough and smooth. The rough coat is medium length with feathering on legs, chest, and belly. The smooth coat is shorter and coarser. Colors include black and white, blue merle, red merle, red and white, and various combinations.'
      }
    ]
  },
  
  // Additional top breeds
  {
    id: '17',
    breed: 'Boxer',
    organization: 'American Kennel Club (AKC)',
    description: 'The Boxer is a medium to large, short-haired breed of dog, developed in Germany. The coat is smooth and tight-fitting.',
    link: 'https://www.akc.org/dog-breeds/boxer/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Boxer is a medium-sized, square-built dog of good substance with short back, strong limbs, and short, tight-fitting coat. His well-developed muscles are clean, hard, and appear smooth under taut skin.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 22.5-25 inches; Females 21-23.5 inches. Weight: Males about 70 pounds; Females about 60 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is short, shiny, lying close to the body. The accepted colors are fawn and brindle. Fawn varies from light tan to mahogany. Brindle ranges from sparse but clearly defined black stripes on a fawn background to such heavy striping that the fawn background appears almost as stripes on a black body.'
      }
    ]
  },
  {
    id: '18',
    breed: 'Great Dane',
    organization: 'American Kennel Club (AKC)',
    description: 'The Great Dane is a German breed of domestic dog known for its giant size. The German name of the breed is Deutsche Dogge.',
    link: 'https://www.akc.org/dog-breeds/great-dane/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Great Dane combines, in its regal appearance, dignity, strength and elegance with great size and a powerful, well-formed, smoothly muscled body. It is one of the giant working breeds.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the shoulder: Males minimum 30 inches; Females minimum 28 inches. Weight: Males 140-175 pounds; Females 110-140 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is short, thick, and clean with a smooth, glossy appearance. The recognized colors are brindle, fawn, blue, black, harlequin, and mantle.'
      }
    ]
  },
  {
    id: '19',
    breed: 'Siberian Husky',
    organization: 'American Kennel Club (AKC)',
    description: 'The Siberian Husky is a medium-sized working sled dog breed that originated in north-eastern Siberia, Russia.',
    link: 'https://www.akc.org/dog-breeds/siberian-husky/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The Siberian Husky is a medium-sized working dog, quick and light on his feet and free and graceful in action. His moderately compact and well furred body, erect ears and brush tail suggest his Northern heritage.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Height at the withers: Males 21-23.5 inches; Females 20-22 inches. Weight: Males 45-60 pounds; Females 35-50 pounds.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is double and medium in length. The undercoat is soft and dense; the outer coat is straight and somewhat flat. All colors from black to pure white are allowed. A variety of markings on the head is common, including many striking patterns not found in other breeds.'
      }
    ]
  },
  {
    id: '20',
    breed: 'French Bulldog',
    organization: 'American Kennel Club (AKC)',
    description: 'The French Bulldog is a breed of domestic dog, bred to be companion dogs. The breed is the result of a cross between Toy Bulldogs imported from England and local ratters in Paris, France, in the 1800s.',
    link: 'https://www.akc.org/dog-breeds/french-bulldog/',
    categories: [
      {
        title: 'General Appearance',
        content: 'The French Bulldog has the appearance of an active, intelligent, muscular dog of heavy bone, smooth coat, compactly built, and of medium or small structure.'
      },
      {
        title: 'Size, Proportion, Substance',
        content: 'Weight: under 28 pounds. Height at the withers: generally about 11-12 inches. The body is compact, with a short back, and is heavy-boned and muscular.'
      },
      {
        title: 'Coat & Color',
        content: 'The coat is moderately fine, brilliant, short and smooth. Skin is soft and loose, especially at the head and shoulders. Acceptable colors include brindle, fawn, white, brindle and white, and fawn and white.'
      }
    ]
  },
  // ...more breeds would continue here
]

export default breedStandards;
