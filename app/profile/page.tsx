export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white p-6">

      <h1 className="text-4xl font-bold mb-2">
        AI TONKEEPER Profil
      </h1>

      <p className="text-blue-200 mb-8">
        Gestion complète de votre compte utilisateur.
      </p>


      <div className="grid md:grid-cols-2 gap-6">


        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">

          <div className="flex items-center gap-4 mb-6">

            <div className="w-20 h-20 rounded-full bg-cyan-400 flex items-center justify-center text-3xl font-bold text-blue-900">
              A
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                User AI TONKEEPER
              </h2>

              <p className="text-blue-200">
                Premium Wallet User
              </p>
            </div>

          </div>


          <div className="space-y-4">

            <div>
              <p className="text-blue-300">
                Email
              </p>
              <p>
                user@example.com
              </p>
            </div>


            <div>
              <p className="text-blue-300">
                TON Address
              </p>

              <p className="break-all">
                Connect your TON wallet
              </p>
            </div>


          </div>


        </div>



        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">


          <h2 className="text-2xl font-bold mb-6">
            Account Status
          </h2>


          <div className="space-y-5">


            <div className="flex justify-between">
              <span>KYC</span>
              <span className="text-yellow-300">
                Pending
              </span>
            </div>


            <div className="flex justify-between">
              <span>Security</span>
              <span className="text-green-300">
                Protected
              </span>
            </div>


            <div className="flex justify-between">
              <span>Referral</span>
              <span className="text-cyan-300">
                Active
              </span>
            </div>


          </div>


          <button className="mt-8 w-full bg-cyan-400 text-blue-950 font-bold py-3 rounded-xl hover:bg-cyan-300">
            Edit Profile
          </button>


        </div>


      </div>


    </main>
  );
}