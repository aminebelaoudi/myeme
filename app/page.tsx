'use client';
/*eslint-disable*/

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBox';
import { ChatBody, AIModel } from '@/types/types';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Text,
  useColorModeValue,
  VStack,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  Heading,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  TextareaProps,
  Progress,
  Badge,
  Container,
  useToast,
  Tooltip,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  SimpleGrid,
  Center,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson, MdUpload, MdCheck, MdArrowForward, MdRefresh, MdSchool, MdAutoStories } from 'react-icons/md';
import Bg from '../public/img/chat/bg-image.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Définir un type pour les messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Définir les romans disponibles
const ROMANS = [
  { id: 'boite-a-merveilles', title: 'La Boîte à merveilles', author: 'Ahmed Sefrioui', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 'dernier-jour-condamne', title: 'Le Dernier Jour d\'un condamné', author: 'Victor Hugo', cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
  { id: 'antigone', title: 'Antigone', author: 'Jean Anouilh', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
];

// Fonction pour formater le texte avec les astérisques
const formatText = (text: string) => {
  // Remplacer les astérisques simples par du texte en gras
  let formattedText = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  
  // Remplacer les sauts de ligne par des balises <br>
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  // Ajouter des paragraphes pour les sections principales
  formattedText = formattedText.replace(/<br><br>/g, '</p><p>');
  
  // Entourer le texte de balises de paragraphe
  formattedText = '<p>' + formattedText + '</p>';
  
  return formattedText;
};

export default function Chat(props: { apiKeyApp: string }) {
  // Input States
  const [inputOnSubmit, setInputOnSubmit] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');
  // Model
  const [model, setModel] = useState<AIModel>('gemini-1.5-flash');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  // Messages history
  const [messages, setMessages] = useState<Message[]>([]);
  // Roman sélectionné
  const [selectedRoman, setSelectedRoman] = useState<string>('');
  // Étape actuelle
  const [step, setStep] = useState<'selection' | 'sujet' | 'redaction' | 'evaluation'>('selection');
  // Texte de l'étudiant
  const [studentText, setStudentText] = useState<string>('');
  // Sujet généré
  const [generatedSubject, setGeneratedSubject] = useState<string>('');
  // Toast pour les notifications
  const toast = useToast();
  // Modal pour l'évaluation
  const { isOpen, onOpen, onClose } = useDisclosure();

  // API Key
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgIcon = useColorModeValue(
    'linear-gradient(180deg, #FBFBFF 0%, #CACAFF 100%)',
    'whiteAlpha.200',
  );
  const brandColor = useColorModeValue('brand.500', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');
  const buttonShadow = useColorModeValue(
    '14px 27px 45px rgba(112, 144, 176, 0.2)',
    'none',
  );
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  const cardBg = useColorModeValue('white', 'navy.800');
  const cardShadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'unset',
  );

  // Fonction pour générer un sujet
  const generateSubject = async () => {
    if (!selectedRoman) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un roman.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      toast({
        title: "Clé API manquante",
        description: "Veuillez entrer une clé API.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!apiKey.startsWith('AIzaSy')) {
      toast({
        title: "Format de clé API invalide",
        description: "Veuillez entrer une clé API Gemini valide.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Génération en cours",
      description: "Nous générons un sujet de réflexion pour vous...",
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    try {
      console.log('Starting API request...');
    const controller = new AbortController();
      
      // Trouver le roman sélectionné
      const roman = ROMANS.find(r => r.id === selectedRoman);
      const romanTitle = roman ? roman.title : '';
      
      // Créer le prompt pour générer un sujet
      const prompt = `Tu es un professeur de français spécialisé dans la préparation au baccalauréat marocain.
Je vais te donner une liste d'exemples de sujets de réflexion.
À partir de cette base, génère un nouveau sujet argumentatif original, non répété, lié à œuvre suivante  : (${romanTitle})

Ton objectif est de :

Créer un sujet qui pousse l'étudiant à réfléchir sur un thème de société ou valeur humaine (liberté, famille, éducation, justice, solitude…)

Faire un lien inspiré (mais pas copié mot pour mot) avec un ou plusieurs éléments du roman choisi (personnage, situation, idée…)

Garder le format "Exprimez votre point de vue et argumentez-le à l'aide d'exemples précis"

Voici des exemples de sujets pour t'inspirer :

Sidi Mohammed trouve refuge dans son monde imaginaire pour fuir la réalité. Croyez-vous que l'imaginaire est nécessaire pour supporter la vie ? Expliquez votre point de vue.

Faut-il toujours obéir à la loi, même si on pense qu'elle est injuste ? Appuyez votre avis sur un exemple tiré de la vie quotidienne ou de l'actualité.

La peine de mort est encore appliquée dans certains pays. Selon vous, peut-on justifier cette pratique ? Argumentez votre position.

Parfois, le silence est plus fort que les mots. Qu'en pensez-vous ?

Dans les trois œuvres étudiées, les personnages affrontent l'injustice à leur manière. Quel est, selon vous, le meilleur moyen de faire face à l'injustice aujourd'hui ?

Maintenant, génère un nouveau sujet en suivant ces instruction( donne moi juste le sujet )`;

    const body: ChatBody = {
        inputCode: prompt,
      model,
      apiKey,
    };

      console.log('Sending request to API...');
    const response = await fetch('./api/chatAPI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to get response from API');
      }

      console.log('Response received, processing stream...');
      const data = response.body;
      if (!data) {
        throw new Error('No data received from API');
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value);
          fullResponse += chunkValue;
          setGeneratedSubject(fullResponse);
        }
      }
      console.log('Stream processing completed');
      
      // Passer à l'étape suivante
      setStep('sujet');
      
      toast({
        title: "Sujet généré",
        description: "Un nouveau sujet de réflexion a été généré pour vous.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        toast({
          title: "Erreur",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du traitement de votre demande.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour évaluer le texte de l'étudiant
  const evaluateText = async () => {
    if (!studentText) {
      toast({
        title: "Texte manquant",
        description: "Veuillez rédiger un texte avant de le soumettre.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      toast({
        title: "Clé API manquante",
        description: "Veuillez entrer une clé API.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!apiKey.startsWith('AIzaSy')) {
      toast({
        title: "Format de clé API invalide",
        description: "Veuillez entrer une clé API Gemini valide.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    onOpen(); // Ouvrir la modal d'évaluation
    
    toast({
      title: "Évaluation en cours",
      description: "Nous évaluons votre texte...",
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    try {
      console.log('Starting API request...');
      const controller = new AbortController();
      
      // Trouver le roman sélectionné
      const roman = ROMANS.find(r => r.id === selectedRoman);
      const romanTitle = roman ? roman.title : '';
      
      // Créer le prompt pour évaluer le texte
      const prompt = `Tu es un professeur de français spécialisé dans la préparation au baccalauréat marocain.
Tu dois évaluer un texte argumentatif d'un étudiant sur le roman "${romanTitle}".

Voici le sujet donné à l'étudiant :
${generatedSubject}

Voici le texte de l'étudiant :
${studentText}

Tu vas corriger le texte d'un élève en te basant sur le barème officiel suivant :

Barème de notation – sur 10 :

Critères du discours (sur 5 points)

Conformité à la consigne : 2 pts

Cohérence de l'argumentation : 1,5 pt

Structure (organisation et progression du texte) : 1,5 pt

Critères de langue (sur 5 points)

Syntaxe correcte : 1 pt

Vocabulaire précis et varié : 1 pt

Orthographe d'usage et grammaticale : 1 pt

Conjugaison (emploi des temps) : 1 pt

Ponctuation appropriée : 1 pt

Ce que tu dois faire maintenant :

Donne une note sur 10, avec le détail des points attribués pour chaque critère.

Rédige un feedback personnalisé en t'adressant directement à l'élève (utilise tu, ton texte, toi...).

Propose trois suggestions d'amélioration concrètes pour l'aider à progresser.

Sois bienveillant, clair, courte , et utilise un langage simple mais précis.`;

      const body: ChatBody = {
        inputCode: prompt,
        model,
        apiKey,
      };

      console.log('Sending request to API...');
      const response = await fetch('./api/chatAPI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'Failed to get response from API');
      }

      console.log('Response received, processing stream...');
      const data = response.body;
      if (!data) {
        throw new Error('No data received from API');
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
      let fullResponse = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
        if (value) {
      const chunkValue = decoder.decode(value);
          fullResponse += chunkValue;
          setOutputCode(fullResponse);
        }
      }
      console.log('Stream processing completed');
      
      // Passer à l'étape suivante
      setStep('evaluation');
      
      toast({
        title: "Évaluation terminée",
        description: "Votre texte a été évalué avec succès.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        toast({
          title: "Erreur",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du traitement de votre demande.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
    setLoading(false);
    onClose(); // Fermer la modal d'évaluation
    }
  };

  // Fonction pour réinitialiser l'application
  const resetApp = () => {
    setSelectedRoman('');
    setStep('selection');
    setStudentText('');
    setGeneratedSubject('');
    setOutputCode('');
    
    toast({
      title: "Réinitialisation",
      description: "L'application a été réinitialisée.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Fonction pour extraire la note du texte d'évaluation
  const extractGrade = (text: string) => {
    const gradeMatch = text.match(/(\d+)\/20/);
    return gradeMatch ? gradeMatch[1] : null;
  };

  return (
    <Flex
      w="100%"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
    >
      {/* Modal d'évaluation */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent p={0} bg="purple.500" borderRadius="xl">
          <ModalHeader textAlign="center" color="white">
            <Icon as={MdSchool} boxSize={8} mb={2} />
            <Text fontSize="xl">Évaluation en cours</Text>
          </ModalHeader>
          <ModalCloseButton color="white" bg="purple.500" />
          <ModalBody bg="white" borderRadius="xl" p={8}>
            <VStack spacing={6}>
              <Box 
                animation="pulse 1.5s infinite ease-in-out"
                sx={{
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                    '100%': { transform: 'scale(1)', opacity: 1 }
                  }
                }}
              >
                <Spinner 
                  size="xl" 
                  color="purple.500" 
                  thickness="4px"
                  speed="0.65s"
                />
              </Box>
              <Text fontSize="md" textAlign="center" color="gray.700">
                Notre professeur virtuel analyse votre texte. Cela peut prendre quelques instants.
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Nous évaluons la pertinence, la structure, les arguments et l'expression.
              </Text>
              <Icon as={MdAutoStories} boxSize={8} color="purple.300" />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Img
        src={Bg.src}
        position={'absolute'}
        w="350px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
        opacity={0.1}
      />
      <Container maxW="1000px" py={4}>
        {/* Titre */}
        <Heading as="h1" size="lg" textAlign="center" mb={4} color={brandColor}>
          Assistant de Préparation au Baccalauréat
        </Heading>
        
        {/* Barre de progression */}
        <Progress 
          value={
            step === 'selection' ? 25 : 
            step === 'sujet' ? 50 : 
            step === 'redaction' ? 75 : 100
          } 
          size="sm" 
          colorScheme="purple" 
          mb={6}
          borderRadius="full"
        />
        
        {/* Étape 1: Sélection du roman */}
        {step === 'selection' && (
          <Card bg={cardBg} boxShadow={cardShadow} borderRadius="14px" mb={6}>
            <CardHeader py={4}>
              <Heading as="h2" size="md" color={brandColor}>
                Étape 1: Sélectionnez un roman
              </Heading>
              <Text color={gray} mt={1} fontSize="sm">
                Choisissez l'une des œuvres suivantes pour générer un sujet de réflexion.
              </Text>
            </CardHeader>
            <CardBody py={2}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {ROMANS.map((roman) => (
                  <Card 
                    key={roman.id} 
                    bg={selectedRoman === roman.id ? 'purple.50' : 'white'} 
                    border={selectedRoman === roman.id ? '2px solid' : '1px solid'} 
                    borderColor={selectedRoman === roman.id ? 'purple.500' : borderColor}
                    borderRadius="14px"
                    cursor="pointer"
                    onClick={() => setSelectedRoman(roman.id)}
                    transition="all 0.3s"
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                  >
                    <Box 
                      h="120px" 
                      bgImage={`url(${roman.cover})`} 
                      bgSize="cover" 
                      bgPosition="center"
                      borderRadius="14px 14px 0 0"
                    />
                    <Box p={3}>
                      <Heading as="h3" size="sm" mb={1}>
                        {roman.title}
                      </Heading>
                      <Text fontSize="xs" color={gray}>
                        {roman.author}
                      </Text>
                    </Box>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
            <CardFooter py={3}>
              <Button
                colorScheme="purple"
                onClick={generateSubject}
                isLoading={loading}
                isDisabled={!selectedRoman}
                rightIcon={<MdArrowForward />}
                size="md"
                w="100%"
              >
                Générer un sujet
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Étape 2: Sujet généré */}
        {step === 'sujet' && (
          <Card bg={cardBg} boxShadow={cardShadow} borderRadius="14px" mb={6}>
            <CardHeader py={4}>
              <Heading as="h2" size="md" color={brandColor}>
                Étape 2: Sujet de réflexion
              </Heading>
              <Text color={gray} mt={1} fontSize="sm">
                Voici le sujet de réflexion généré pour vous.
              </Text>
            </CardHeader>
            <CardBody py={2}>
              <Box
                p={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="14px"
                bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
              >
                <Text whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall">
                  {generatedSubject}
                </Text>
              </Box>
            </CardBody>
            <CardFooter py={3}>
              <Button
                colorScheme="purple"
                onClick={() => setStep('redaction')}
                rightIcon={<MdArrowForward />}
                size="md"
                w="100%"
              >
                Passer à la rédaction
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Étape 3: Rédaction */}
        {step === 'redaction' && (
          <Card bg={cardBg} boxShadow={cardShadow} borderRadius="14px" mb={6}>
            <CardHeader py={4}>
              <Heading as="h2" size="md" color={brandColor}>
                Étape 3: Rédaction
              </Heading>
              <Text color={gray} mt={1} fontSize="sm">
                Rédigez votre texte argumentatif en réponse au sujet.
              </Text>
            </CardHeader>
            <CardBody py={2}>
              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Sujet:</FormLabel>
                <Box
                  p={3}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="14px"
                  mb={3}
                  bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                >
                  <Text whiteSpace="pre-wrap" fontSize="sm">{generatedSubject}</Text>
                </Box>
                <FormLabel fontWeight="bold" fontSize="sm">Votre texte:</FormLabel>
                <Textarea
                  value={studentText}
                  onChange={(e) => setStudentText(e.target.value)}
                  placeholder="Rédigez votre texte ici..."
                  size="md"
                  minH="250px"
                  mb={3}
                  borderRadius="14px"
                  borderColor={borderColor}
                  fontSize="sm"
                  _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                />
                <FormHelperText fontSize="xs">
                  Rédigez votre texte argumentatif en réponse au sujet.
                </FormHelperText>
              </FormControl>
            </CardBody>
            <CardFooter py={3}>
              <Button
                colorScheme="purple"
                onClick={evaluateText}
                isLoading={loading}
                isDisabled={!studentText}
                rightIcon={<MdCheck />}
                size="md"
                w="100%"
              >
                Soumettre pour évaluation
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Étape 4: Évaluation */}
        {step === 'evaluation' && (
          <Card bg={cardBg} boxShadow={cardShadow} borderRadius="14px" mb={6}>
            <CardHeader py={4}>
              <Heading as="h2" size="md" color={brandColor}>
                Étape 4: Évaluation
              </Heading>
              <Text color={gray} mt={1} fontSize="sm">
                Voici l'évaluation de votre texte.
              </Text>
            </CardHeader>
            <CardBody py={2}>
              <Box
                p={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="14px"
                bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
              >
                {loading ? (
                  <Center py={6} flexDirection="column" gap={4}>
                    <Box 
                      animation="pulse 1.5s infinite ease-in-out"
                      sx={{
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                          '100%': { transform: 'scale(1)', opacity: 1 }
                        }
                      }}
                    >
                      <Spinner 
                        size="xl" 
                        color="purple.500" 
                        thickness="4px"
                        speed="0.65s"
                      />
                    </Box>
                    <Text fontSize="md" fontWeight="medium" color="purple.500">
                      Évaluation en cours...
                    </Text>
                    <Text fontSize="sm" color={gray}>
                      Notre professeur virtuel analyse votre texte. Cela peut prendre quelques instants.
                    </Text>
                  </Center>
                ) : (
                  <Box className="markdown-content" fontSize="sm">
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatText(outputCode) }} 
                      style={{ 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        padding: '10px 0'
                      }}
                    />
                  </Box>
                )}
              </Box>
            </CardBody>
            <CardFooter py={3}>
              <Button
                colorScheme="purple"
                onClick={resetApp}
                leftIcon={<MdRefresh />}
                size="md"
                w="100%"
              >
                Recommencer
              </Button>
            </CardFooter>
          </Card>
        )}

        <Flex
          justify="center"
          mt="10px"
          direction={{ base: 'column', md: 'row' }}
          alignItems="center"
        >
          <Text fontSize="xs" textAlign="center" color={gray}>
            Free Research Preview. Gemini may produce inaccurate information
            about people, places, or facts.
          </Text>
          <Link href="https://ai.google.dev/">
            <Text
              fontSize="xs"
              color={textColor}
              fontWeight="500"
              textDecoration="underline"
            >
              Gemini AI
            </Text>
          </Link>
        </Flex>
      </Container>
    </Flex>
  );
}
