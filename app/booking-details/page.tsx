"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function BookingDetailsPage() {

  const [travelers, setTravelers] = useState([
    {
      fullName: "",
      email: "",
      phone: "",
      age: "",
      gender: "",
      aadhaarNumber: "",
      medicalIssues: "",
      emergencyPhone: "",
    },
  ]);

  const [leadTraveler, setLeadTraveler] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [agreed, setAgreed] = useState(false);

  // =========================================
  // ADD NEW TRAVELER
  // =========================================

  const addTraveler = () => {
    setTravelers([
      ...travelers,
      {
        fullName: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        aadhaarNumber: "",
        medicalIssues: "",
        emergencyPhone: "",
      },
    ]);
  };

  // =========================================
  // UPDATE TRAVELER
  // =========================================

  const updateTraveler = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...travelers];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setTravelers(updated);
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async () => {

    if (!agreed) {
      alert("Please accept terms & conditions");
      return;
    }

    const payload = {
      leadTraveler,
      travelers,
    };

    console.log(payload);

    // NEXT STEP API CALL
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-yellow-400">
            Traveler Details
          </h1>

          <p className="text-gray-400 mt-2">
            Enter all traveler information before checkout
          </p>
        </motion.div>

        {/* LEAD TRAVELER */}

        <Card className="p-6 bg-zinc-900 border-zinc-800 mb-8">

          <h2 className="text-2xl font-bold mb-6 text-yellow-400">
            Lead Traveler
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <Input
              placeholder="Full Name"
              value={leadTraveler.name}
              onChange={(e) =>
                setLeadTraveler({
                  ...leadTraveler,
                  name: e.target.value,
                })
              }
            />

            <Input
              placeholder="Email"
              value={leadTraveler.email}
              onChange={(e) =>
                setLeadTraveler({
                  ...leadTraveler,
                  email: e.target.value,
                })
              }
            />

            <Input
              placeholder="Phone"
              value={leadTraveler.phone}
              onChange={(e) =>
                setLeadTraveler({
                  ...leadTraveler,
                  phone: e.target.value,
                })
              }
            />

          </div>
        </Card>

        {/* TRAVELERS */}

        <div className="space-y-6">

          {travelers.map((traveler, index) => (

            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >

              <Card className="p-6 bg-zinc-900 border-zinc-800">

                <h2 className="text-xl font-bold mb-6 text-yellow-400">
                  Traveler {index + 1}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">

                  <Input
                    placeholder="Full Name"
                    value={traveler.fullName}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "fullName",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    placeholder="Email"
                    value={traveler.email}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "email",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    placeholder="Phone"
                    value={traveler.phone}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "phone",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    placeholder="Age"
                    type="number"
                    value={traveler.age}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "age",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    placeholder="Gender"
                    value={traveler.gender}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "gender",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    placeholder="Aadhaar Number"
                    value={traveler.aadhaarNumber}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "aadhaarNumber",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    placeholder="Emergency Contact"
                    value={traveler.emergencyPhone}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "emergencyPhone",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    placeholder="Medical Issues"
                    value={traveler.medicalIssues}
                    onChange={(e) =>
                      updateTraveler(
                        index,
                        "medicalIssues",
                        e.target.value
                      )
                    }
                  />

                </div>

              </Card>

            </motion.div>

          ))}

        </div>

        {/* ADD TRAVELER */}

        <Button
          onClick={addTraveler}
          className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          + Add Traveler
        </Button>

        {/* CONSENT */}

        <Card className="p-6 bg-zinc-900 border-zinc-800 mt-8">

          <div className="flex items-start gap-3">

            <Checkbox
              checked={agreed}
              onCheckedChange={(value) =>
                setAgreed(value as boolean)
              }
            />

            <p className="text-sm text-gray-300">
              I confirm that all travelers are physically fit
              to participate in adventure activities and agree
              to HumRahi Adventures terms & conditions.
            </p>

          </div>

        </Card>

        {/* SUBMIT */}

        <Button
          onClick={handleSubmit}
          className="w-full mt-8 bg-yellow-500 hover:bg-yellow-600 text-black h-14 text-lg"
        >
          Continue To Review
        </Button>

      </div>

    </div>
  );
}