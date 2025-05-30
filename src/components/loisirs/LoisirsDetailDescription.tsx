
import { Calendar, MapPin, Users } from "lucide-react";
import { formatDisplayDate, parseDate } from "@/services/loisirs";
import { format, isAfter, isBefore, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";

interface LoisirsDetailDescriptionProps {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  currentParticipants: number;
  maxParticipants: number;
}

const LoisirsDetailDescription = ({ 
  title, 
  description, 
  location, 
  startDate, 
  endDate,
  currentParticipants,
  maxParticipants
}: LoisirsDetailDescriptionProps) => {
  // Déterminer si l'activité est à venir, en cours ou terminée
  const now = new Date();
  
  // Utiliser la fonction parseDate du service au lieu de réimplémenter la logique
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  const isStartDateValid = start !== null;
  const isEndDateValid = end !== null;
  
  // Déterminer le statut de l'activité
  const isUpcoming = isStartDateValid && isAfter(start!, now);
  const isPast = isEndDateValid && isBefore(end!, now);
  const isOngoing = isStartDateValid && isEndDateValid && !isUpcoming && !isPast;
  const isDatesInvalid = !isStartDateValid || !isEndDateValid;

  // Définir le statut et la couleur associée
  let statusText = "";
  let statusClass = "";
  
  if (isDatesInvalid) {
    statusText = "Dates non valides";
    statusClass = "bg-yellow-100 text-yellow-800";
  } else if (isUpcoming) {
    statusText = "À venir";
    statusClass = "bg-blue-100 text-blue-800";
  } else if (isOngoing) {
    statusText = "En cours";
    statusClass = "bg-green-100 text-green-800";
  } else {
    statusText = "Terminé";
    statusClass = "bg-gray-100 text-gray-800";
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl font-bold text-creole-blue">{title}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
          {statusText}
        </span>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-creole-green" />
          <span>
            {startDate === endDate 
              ? `Le ${formatDisplayDate(startDate)}`
              : `Du ${formatDisplayDate(startDate)} au ${formatDisplayDate(endDate)}`
            }
            {isDatesInvalid && " (Dates à confirmer)"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-creole-green" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-creole-green" />
          <span>
            {currentParticipants}/{maxParticipants} participants
            {currentParticipants >= maxParticipants && " (Complet)"}
          </span>
        </div>
      </div>
      
      <div className="prose max-w-none">
        <h2 className="text-xl font-semibold text-creole-blue mb-2">Description</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default LoisirsDetailDescription;
