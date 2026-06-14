import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { getUserId } from '../utils/anonymousUser';

// ─── Wizard Data Types ──────────────────────────────────────────────────────
interface WizardData {
  age_type: string;
  ethnicity: string;
  body_type: string;
  bust_size: string;
  butt_size: string;
  hair_color: string;
  hair_style: string;
  eye_color: string;
  voice_id: string;
  voice_name: string;
  occupation: string;
  hobbies: string;
  personality_traits: string;
  relationship_type: string;
  outfit: string;
  name: string;
}

const initialData: WizardData = {
  age_type: '',
  ethnicity: '',
  body_type: '',
  bust_size: '',
  butt_size: '',
  hair_color: '',
  hair_style: '',
  eye_color: '',
  voice_id: '',
  voice_name: '',
  occupation: '',
  hobbies: '',
  personality_traits: '',
  relationship_type: '',
  outfit: '',
  name: '',
};

// ─── Voice Options ──────────────────────────────────────────────────────────
const voiceOptions = [
  { id: 'bv62BmVlrpG0pQegOpuN', name: 'Anna', description: 'Intimate & sultry — soft whispers that draw you in' },
  { id: 'o9yXv9EFSasRrRM3x6xK', name: 'Glinda', description: 'Confident & sly — playful with a knowing edge' },
  { id: 'j05EIz3iI3JmBTWC3CsA', name: 'Natasha', description: 'ASMR whisperer — breathy and hypnotic' },
  { id: 'TC0Zp7WVFzhA8zpTlRqV', name: 'Aria', description: 'Dark velvet — deep, commanding, and seductive' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Sweet & youthful — girl-next-door warmth' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Mature & elegant — sophisticated and alluring' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'British charm — refined with a teasing lilt' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Playful & bubbly — energetic and flirtatious' },
];

// ─── Step Configuration ─────────────────────────────────────────────────────
const TOTAL_STEPS = 10;

const stepTitles = [
  'Age Type',
  'Ethnicity',
  'Body Type',
  'Body Details',
  'Appearance',
  'Voice',
  'Personality',
  'Relationship',
  'Outfit',
  'Name Her',
];

const stepDescriptions = [
  'How old is your ideal companion?',
  'What is her background?',
  'What body type do you prefer?',
  'Let\'s get specific about her figure...',
  'Design her look — hair and eyes',
  'Choose how she sounds when she speaks to you',
  'Define who she is on the inside',
  'What\'s your dynamic together?',
  'What is she wearing when you meet?',
  'Give her a name to make her yours',
];

// ─── Option Card Component ──────────────────────────────────────────────────
function OptionCard({
  label,
  description,
  selected,
  onClick,
  icon,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left w-full group
        ${selected
          ? 'border-velvet-gold bg-velvet-gold/10 shadow-lg shadow-velvet-gold/20'
          : 'border-purple-800/40 bg-velvet-mid/30 hover:border-purple-600/60 hover:bg-velvet-mid/50'
        }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-velvet-gold rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-velvet-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <p className={`font-semibold text-sm ${selected ? 'text-velvet-gold' : 'text-white'}`}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Voice Card Component ───────────────────────────────────────────────────
function VoiceCard({
  voice,
  selected,
  onClick,
}: {
  voice: typeof voiceOptions[0];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
        ${selected
          ? 'border-velvet-gold bg-velvet-gold/10 shadow-lg shadow-velvet-gold/20'
          : 'border-purple-800/40 bg-velvet-mid/30 hover:border-purple-600/60 hover:bg-velvet-mid/50'
        }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-velvet-gold rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-velvet-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-velvet-gold/60 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07l-1.41-1.41a3 3 0 000-4.24l1.41-1.42z" />
          </svg>
        </div>
        <div>
          <p className={`font-semibold ${selected ? 'text-velvet-gold' : 'text-white'}`}>
            {voice.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{voice.description}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Main Wizard Component ──────────────────────────────────────────────────
export default function CreateCompanion() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(initialData);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const userId = getUserId();

  const createMutation = trpc.createCustomCompanion.useMutation();

  const updateField = (field: keyof WizardData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!data.age_type;
      case 1: return !!data.ethnicity;
      case 2: return !!data.body_type;
      case 3: return !!data.bust_size && !!data.butt_size;
      case 4: return !!data.hair_color && !!data.hair_style && !!data.eye_color;
      case 5: return !!data.voice_id;
      case 6: return !!data.occupation && !!data.personality_traits;
      case 7: return !!data.relationship_type;
      case 8: return !!data.outfit;
      case 9: return !!data.name;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const result = await createMutation.mutateAsync({
        userId,
        name: data.name,
        age_type: data.age_type as 'young' | 'mature',
        ethnicity: data.ethnicity,
        body_type: data.body_type,
        bust_size: data.bust_size,
        butt_size: data.butt_size,
        hair_color: data.hair_color,
        hair_style: data.hair_style,
        eye_color: data.eye_color,
        voice_id: data.voice_id,
        voice_name: data.voice_name,
        occupation: data.occupation,
        hobbies: data.hobbies || 'various interests',
        personality_traits: data.personality_traits,
        relationship_type: data.relationship_type,
        outfit: data.outfit,
      });

      // Navigate to chat with the new companion
      navigate(`/chat/${result.id}`);
    } catch (error) {
      console.error('Failed to create companion:', error);
      setIsCreating(false);
    }
  };

  // ─── Step Renderers ─────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0: // Age Type
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OptionCard
              label="Young (20s)"
              description="Youthful energy, playful, adventurous"
              icon="🌸"
              selected={data.age_type === 'young'}
              onClick={() => updateField('age_type', 'young')}
            />
            <OptionCard
              label="Mature / MILF (30s-40s)"
              description="Experienced, confident, sensual wisdom"
              icon="🔥"
              selected={data.age_type === 'mature'}
              onClick={() => updateField('age_type', 'mature')}
            />
          </div>
        );

      case 1: // Ethnicity
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { value: 'white', label: 'White / Caucasian', icon: '🤍' },
              { value: 'black', label: 'Black / African', icon: '🖤' },
              { value: 'asian', label: 'Asian', icon: '💛' },
              { value: 'latina', label: 'Latina / Hispanic', icon: '🧡' },
              { value: 'mixed', label: 'Mixed / Other', icon: '💜' },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={data.ethnicity === opt.value}
                onClick={() => updateField('ethnicity', opt.value)}
              />
            ))}
          </div>
        );

      case 2: // Body Type
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { value: 'slim', label: 'Slim', description: 'Slender, graceful, delicate frame', icon: '🦋' },
              { value: 'athletic', label: 'Athletic', description: 'Toned, fit, strong and sculpted', icon: '💪' },
              { value: 'curvy', label: 'Curvy', description: 'Hourglass figure, feminine curves', icon: '⏳' },
              { value: 'thick', label: 'Thick', description: 'Full-figured, voluptuous, abundant', icon: '🍑' },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                icon={opt.icon}
                selected={data.body_type === opt.value}
                onClick={() => updateField('body_type', opt.value)}
              />
            ))}
          </div>
        );

      case 3: // Body Details
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-velvet-gold">Bust Size</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'small', label: 'Small', icon: 'A-B' },
                  { value: 'medium', label: 'Medium', icon: 'C' },
                  { value: 'large', label: 'Large', icon: 'D-DD' },
                  { value: 'extra-large', label: 'Extra Large', icon: 'E+' },
                ].map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.icon}
                    selected={data.bust_size === opt.value}
                    onClick={() => updateField('bust_size', opt.value)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-velvet-gold">Butt Size</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: 'small', label: 'Small', icon: '🍑' },
                  { value: 'medium', label: 'Medium', icon: '🍑🍑' },
                  { value: 'large', label: 'Large', icon: '🍑🍑🍑' },
                  { value: 'extra-large', label: 'Extra Large', icon: '🍑🍑🍑🍑' },
                ].map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.icon}
                    selected={data.butt_size === opt.value}
                    onClick={() => updateField('butt_size', opt.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Appearance
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-3">
                <span className="text-velvet-gold">Hair Color</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {['Blonde', 'Brunette', 'Black', 'Red', 'Auburn', 'Platinum', 'Pink', 'Purple'].map((color) => (
                  <OptionCard
                    key={color}
                    label={color}
                    selected={data.hair_color === color.toLowerCase()}
                    onClick={() => updateField('hair_color', color.toLowerCase())}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">
                <span className="text-velvet-gold">Hair Style</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Long & Straight', 'Long & Wavy', 'Long & Curly', 'Short & Sleek', 'Bob Cut', 'Pixie Cut'].map((style) => (
                  <OptionCard
                    key={style}
                    label={style}
                    selected={data.hair_style === style.toLowerCase()}
                    onClick={() => updateField('hair_style', style.toLowerCase())}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">
                <span className="text-velvet-gold">Eye Color</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'].map((color) => (
                  <OptionCard
                    key={color}
                    label={color}
                    selected={data.eye_color === color.toLowerCase()}
                    onClick={() => updateField('eye_color', color.toLowerCase())}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Voice
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {voiceOptions.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                selected={data.voice_id === voice.id}
                onClick={() => {
                  updateField('voice_id', voice.id);
                  updateField('voice_name', voice.name);
                }}
              />
            ))}
          </div>
        );

      case 6: // Personality
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2">
                <span className="text-velvet-gold">Occupation</span>
              </h3>
              <p className="text-gray-400 text-xs mb-3">What does she do? This shapes her conversation style.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Model', 'Nurse', 'Teacher', 'Artist', 'Bartender', 'CEO',
                  'Dancer', 'Fitness Trainer', 'Photographer', 'Therapist', 'Student', 'Musician',
                ].map((occ) => (
                  <OptionCard
                    key={occ}
                    label={occ}
                    selected={data.occupation === occ.toLowerCase()}
                    onClick={() => updateField('occupation', occ.toLowerCase())}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">
                <span className="text-velvet-gold">Personality Traits</span>
              </h3>
              <p className="text-gray-400 text-xs mb-3">Pick the traits that define her (select multiple).</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  'Shy', 'Bold', 'Nerdy', 'Wild', 'Romantic', 'Dominant',
                  'Submissive', 'Playful', 'Mysterious', 'Caring', 'Sarcastic', 'Seductive',
                ].map((trait) => {
                  const traits = data.personality_traits.split(',').filter(Boolean);
                  const isSelected = traits.includes(trait.toLowerCase());
                  return (
                    <OptionCard
                      key={trait}
                      label={trait}
                      selected={isSelected}
                      onClick={() => {
                        if (isSelected) {
                          updateField(
                            'personality_traits',
                            traits.filter((t) => t !== trait.toLowerCase()).join(',')
                          );
                        } else {
                          updateField(
                            'personality_traits',
                            [...traits, trait.toLowerCase()].join(',')
                          );
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">
                <span className="text-velvet-gold">Hobbies & Interests</span>
              </h3>
              <input
                type="text"
                value={data.hobbies}
                onChange={(e) => updateField('hobbies', e.target.value)}
                placeholder="e.g. yoga, cooking, gaming, reading, dancing..."
                className="w-full bg-velvet-dark/80 border border-purple-800/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-velvet-gold/60 transition-colors"
              />
            </div>
          </div>
        );

      case 7: // Relationship Type
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { value: 'girlfriend', label: 'Girlfriend', description: 'Loving, affectionate, romantically devoted', icon: '💕' },
              { value: 'friends-with-benefits', label: 'Friends with Benefits', description: 'Casual, fun, no strings attached', icon: '😏' },
              { value: 'dominant', label: 'Dominant', description: 'She takes control — commanding and powerful', icon: '👑' },
              { value: 'submissive', label: 'Submissive', description: 'Eager to please, obedient, devoted', icon: '🎀' },
              { value: 'sugar-baby', label: 'Sugar Baby', description: 'Glamorous, appreciative, playfully materialistic', icon: '💎' },
              { value: 'wife', label: 'Wife', description: 'Deep intimacy, comfort, long-term passion', icon: '💍' },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                icon={opt.icon}
                selected={data.relationship_type === opt.value}
                onClick={() => updateField('relationship_type', opt.value)}
              />
            ))}
          </div>
        );

      case 8: // Outfit
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { value: 'casual', label: 'Casual', description: 'Jeans, t-shirt, relaxed and approachable', icon: '👕' },
              { value: 'lingerie', label: 'Lingerie', description: 'Lace, silk, barely-there intimates', icon: '🩱' },
              { value: 'business', label: 'Business', description: 'Power suit, pencil skirt, professional', icon: '👔' },
              { value: 'athletic', label: 'Athletic', description: 'Sports bra, leggings, active and fit', icon: '🏃‍♀️' },
              { value: 'formal-dress', label: 'Formal Dress', description: 'Evening gown, elegant and stunning', icon: '👗' },
              { value: 'bikini', label: 'Bikini', description: 'Beach-ready, sun-kissed, minimal', icon: '👙' },
              { value: 'cosplay', label: 'Cosplay', description: 'Fantasy costume, creative and playful', icon: '🎭' },
              { value: 'sleepwear', label: 'Sleepwear', description: 'Silk pajamas, cozy and intimate', icon: '🌙' },
              { value: 'leather', label: 'Leather', description: 'Edgy, bold, dominatrix vibes', icon: '🖤' },
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                icon={opt.icon}
                selected={data.outfit === opt.value}
                onClick={() => updateField('outfit', opt.value)}
              />
            ))}
          </div>
        );

      case 9: // Name
        return (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-velvet-gold/80 to-purple-900 flex items-center justify-center text-4xl mb-4 shadow-lg shadow-velvet-gold/20">
                ✨
              </div>
              <p className="text-gray-300 text-sm">
                She's almost ready. Give her a name to bring her to life.
              </p>
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter her name..."
              maxLength={50}
              className="w-full bg-velvet-dark/80 border-2 border-purple-800/50 rounded-xl px-6 py-4 text-white text-xl text-center placeholder-gray-500 focus:outline-none focus:border-velvet-gold/60 transition-colors font-heading"
            />
            {data.name && (
              <div className="text-center animate-fade-in">
                <p className="text-velvet-gold font-heading text-lg">
                  "{data.name}" — your custom companion
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {data.age_type === 'young' ? 'Young' : 'Mature'} • {data.ethnicity} • {data.body_type} • {data.relationship_type}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Progress Bar ─────────────────────────────────────────────────────────
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">
            Create Your <span className="text-velvet-gold">Dream Companion</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Design every detail. She'll be uniquely yours.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span className="text-xs text-velvet-gold font-semibold">
              {stepTitles[step]}
            </span>
          </div>
          <div className="h-2 bg-velvet-dark rounded-full overflow-hidden border border-purple-800/30">
            <div
              className="h-full bg-gradient-to-r from-velvet-gold to-yellow-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-velvet-gold' : 'bg-purple-800/50'
                } ${i === step ? 'scale-150' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Step Card */}
        <div className="card-dark min-h-[400px]">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-bold text-white mb-1">
              {stepTitles[step]}
            </h2>
            <p className="text-gray-400 text-sm">{stepDescriptions[step]}</p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-800/30">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                step === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white border border-purple-800/50 hover:border-purple-600'
              }`}
            >
              ← Back
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  canProceed()
                    ? 'btn-gold'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canProceed() || isCreating}
                className={`px-8 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                  canProceed() && !isCreating
                    ? 'bg-gradient-to-r from-velvet-gold to-yellow-500 text-velvet-dark shadow-lg shadow-velvet-gold/30 hover:shadow-velvet-gold/50 hover:scale-105'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  '✨ Bring Her to Life'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
