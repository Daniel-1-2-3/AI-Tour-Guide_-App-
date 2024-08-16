import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import InfoBox from '../components/InfoBox'
import NavBar from '../components/NavBar'
import Spinner from '../components/Spinner'

const InformationPg = ({photo=null, apiKey=''}) => {
  const photoUrl = photo;
  //const photoUrl = 'https://media.npr.org/assets/img/2019/12/10/steamboat_geyser-1_custom-26a3f1b17b84670c7f1b83b397847ece85c13f3c.jpg'
  const OPENAI_API_KEY = apiKey;
  const [information, setInformation] = useState(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  
  const getCoordinates = () => {
    return new Promise((resolve, reject) => {
      const successCallback = (position) => {
        resolve([position.coords.latitude, position.coords.longitude]);
      };
      const errorCallback = (error) => {
        reject(error.message);
      };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
          enableHighAccuracy: true
        });
      }
    });
  };

  useEffect(() => {
    const fetchInfo = async() => {
      const coords = await getCoordinates()
      //const coords = [44.7165, -110.4185] 
      const geyser_coords = "Geysers: (Old Faithful: 44.4595, -110.8281; Castle Geyser: 44.4616, -110.8320; Grand Geyser: 44.4600, -110.8318; Beehive Geyser: 44.4610, -110.8322; Daisy Geyser: 44.4593, -110.8287; Lone Star Geyser: 44.5424, -110.4440; Steamboat Geyser: 44.7160, -110.4190; Grotto Geyser: 44.4575, -110.8303)"
      const hot_spring_coords = "Hot Springs: (Grand Prismatic Spring: 44.5250, -110.8281; Mammoth Hot Springs: 44.9271, -110.6887; Yellowstone Lake Hot Springs: 44.5235, -110.4793; Sulphur Caldron: 44.7314, -110.6911; Black Pool: 44.5245, -110.8315; Morning Glory Pool: 44.4580, -110.8279; Upper Terrace Hot Springs: 44.9271, -110.6890; Sulphur Caldron: 44.7314, -110.6911; Porcelain Basin Hot Springs: 44.7313, -110.7043; Peach Spring: 44.5300, -110.8260)"
      const waterfall_coords = "Waterfalls: (Lower Falls: 44.7267, -110.5108; Upper Falls: 44.7350, -110.5115; Tower Fall: 44.7315, -110.4531; Mystic Falls: 44.5511, -110.4852; Nez Perce Creek Falls: 44.7996, -110.4111)"
      const mud_pot_coords = "Mud Pots: (Artists Paint Pots: 44.6413, -110.5387; Fountain Paint Pots: 44.5425, -110.5462)"
      const basin_coords = "Basins: (Norris Geyser Basin: 44.7261, -110.6980; Upper Geyser Basin: 44.4595, -110.8281; Lower Geyser Basin: 44.5537, -110.8258; West Thumb Geyser Basin: 44.3946, -110.5264; Biscuit Basin: 44.5471, -110.7031; Porcelain Basin: 44.7313, -110.7043)"
      const valley_coords = "Valleys: (Lamar Valley: 44.7804, -110.4116; Hayden Valley: 44.6852, -110.2260; Blacktail Plateau: 44.7850, -110.3780; Pelican Valley: 44.4660, -110.4350; Gibbon Valley: 44.7911, -110.5555)"
      const coordReferences = `Coordinate References -> ${geyser_coords}, ${hot_spring_coords}, ${waterfall_coords}, ${mud_pot_coords}, ${basin_coords}, ${valley_coords}`

      const prompt = `This picture was taken at coordinates (${coords[0]}${coords[1]}). 
      Give 6 cool facts and/or details about the main focus of this picture (REQUIRMENTS: Put what the main focus is in [] brackets), that should be a balance between scientific facts and quirks that may interest younger children. 
      Identifying what this picture is depicting, please be specific as possible about the location. If it is an attraction site, compare the picture's location/coordinates with these coordinates: ${coordReferences}
      to see if it is any of those. If the image case 1 (depicts scenery, but isn't a known attraction) or case 2(does not depict scenery), just give the man focus and 6 facts as best you can about the place in question by looking at the picture and coordinates.`

      setIsLoading(true);
      if (photoUrl){
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: "system", content: [{type: "text", text: "You are a great tour guide for tourist attractions, especially natural ones. Your goal is to give interesting facts about the image."}]
              },
                {
                  role: "user",
                  "content": [
                    {
                      type: "text",
                      text: `${prompt}`
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `${photoUrl}`
                      }
                    }
                  ]
                }
              ],
              max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`OpenAI API error: ${error}`);
        }

        const data = await response.json();
        const notes = data.choices[0].message.content.trim();
        setInformation(notes)

        let title = (notes.slice(notes.indexOf('[')+1, notes.indexOf(']')))
        if (notes.indexOf('[') < 0){
          setTitle(notes.slice(0, notes.indexOf(':')));
        } else {
          setTitle(title.charAt(0).toUpperCase() + title.slice(1));
        }
        setIsLoading(false);
      }
    }

    fetchInfo();
  }, [OPENAI_API_KEY, photoUrl])

  return (
    <>
      <NavBar cameraPage={false} />
      <div className='min-h-screen bg-gray-950 justify-center p-3'>
        { isLoading ?
          <Spinner /> 
          :
          <>
            <div className='flex'>
              <div className='w-full flex items-center justify-center bg-gray-950'>
                {photoUrl && <img className='rounded-2xl object-center w-3/4 mt-8' src={photoUrl} alt="Captured Frame" />}
              </div>
            </div>
            <div className='w-full bg-transparent flex justify-center align-middle'>
              <div className='w-3/4 bg-gray-600 p-3 rounded-x l align-middle'>
                <p className='text-white font-semibold text-md text-center mt-3'>{title}</p>
              </div>
            </div>
            {information && <InfoBox info={information}/>}
          </>
        }
      </div>
    </>
  )
}

InformationPg.propTypes = {
  photo: PropTypes.string,
  apiKey: PropTypes.string,
}

export default InformationPg