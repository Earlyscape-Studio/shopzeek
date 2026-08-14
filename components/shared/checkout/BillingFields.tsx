import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import lgasData from "@/data/nigeria-lgas.json";

const states = Object.keys(lgasData).sort();

interface DefaultValues {
  full_name?: string | null
  address_line1?: string | null
  city?: string | null
  state?: string | null
  phone?: string | null
  email?: string | null
}
interface Props {
  state: string;
  lga: string;
  onStateChange: (value: string) => void;
  onLgaChange: (value: string) => void;
  namePrefix?: string;
  showContactFields?: boolean;
  defaultValues?: DefaultValues | null
}

export function BillingFields({
  state,
  lga,
  onStateChange,
  onLgaChange,
  namePrefix = "",
  showContactFields = true,
  defaultValues
}: Props) {
  const n = namePrefix;
  const lgas: string[] = state ? ((lgasData as Record<string, string[]>)[state] ?? []) : [];

  const handleStateChange = (value: string) => {
    onStateChange(value);
    onLgaChange("");
  };

  const savedFirstName = defaultValues?.full_name?.split(" ")[0] ?? ""
  const savedLastName = defaultValues?.full_name?.split(" ").slice(1).join(" ") ?? ""

  return (
    <div className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input
            name={`${n}firstName`}
            placeholder="First name"
            defaultValue={!namePrefix ? savedFirstName : ""}
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input
            name={`${n}lastName`}
            placeholder="Last name"
            defaultValue={!namePrefix ? savedLastName : ""}
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Address</label>
        <Input
          name={`${n}address`}
          defaultValue={!namePrefix ? (defaultValues?.address_line1 ?? "") : ""}
          className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
          required
        />
      </div>

      {/* Country / State / LGA / City / Zip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {!namePrefix && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Country</label>
            <Select name="country" defaultValue="ng">
              <SelectTrigger className="h-11 border-gray-200 rounded-lg focus:ring-orange-500">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ng">Nigeria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">State</label>
          <input type="hidden" name={`${n}state`} value={state} />
          <Select value={state} onValueChange={handleStateChange}>
            <SelectTrigger className="h-11 border-gray-200 rounded-lg focus:ring-orange-500">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5" id={`${n}lga-field`}>
          <label className="text-sm font-medium text-gray-700">
            LGA <span className="text-orange-500">*</span>
          </label>
          {!state ? (
            <DisabledSlot label="Select a state first" />
          ) : (
            <>
              <input type="hidden" name={`${n}lga`} value={lga} />
              <Select
                value={lga}
                onValueChange={onLgaChange}
                disabled={lgas.length === 0}
              >
                <SelectTrigger
                  className={`h-11 rounded-lg ${!lga ? "border-orange-300 ring-1 ring-orange-100" : "border-gray-200"
                    }`}
                >
                  <SelectValue placeholder="Select LGA" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  {lgas.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          {state && !lga && (
            <p className="text-xs text-orange-500">
              Required to calculate shipping and place your order
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">City</label>
          <Input
            name={`${n}city`}
            defaultValue={!namePrefix ? (defaultValues?.city ?? "") : ""}
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Zip Code</label>
          <Input
            name={`${n}zipcode`}
            className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
          />
        </div>
      </div>

      {/* Email / Phone */}
      {showContactFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              name="email"
              type="email"
              defaultValue={defaultValues?.email ?? ""}
              className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <Input
              name="phone"
              type="tel"
              defaultValue={!namePrefix ? (defaultValues?.phone ?? "") : ""}
              className="h-11 border-gray-200 rounded-lg focus-visible:ring-orange-500"
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DisabledSlot({ label }: { label: string }) {
  return (
    <div className="h-11 border border-gray-200 rounded-lg bg-gray-50 flex items-center px-3 text-sm text-gray-400 select-none">
      {label}
    </div>
  );
}