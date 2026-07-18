import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";
import AuthShell from "../../layouts/auth-shell";

const ROLES = [
  {
    id: "shopper",
    title: "I'm here to shop",
    description: "Discover unique pieces from independent designers and boutiques.",
    icon: ShoppingBag,
  },
  {
    id: "seller",
    title: "I'm a designer / seller",
    description: "Set up your storefront and start selling to shoppers nationwide.",
    icon: Store,
  },
];

const SignupRole = () => {
  const navigate = useNavigate();

  return (
    <AuthShell title="Join Sally-K">
      <p className="text-[13px] text-[#65799A] text-center mb-6">
        Tell us why you're here so we can set up the right experience for you.
      </p>

      <div className="flex flex-col gap-4">
        {ROLES.map(({ id, title, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => navigate(`/signup/${id}`)}
            className="group flex items-center gap-4 text-left border border-[#E7E1E4] rounded-2xl p-4 hover:border-[#ED1280] hover:bg-[#FDF1F7] transition-colors"
          >
            <span className="w-12 h-12 shrink-0 rounded-xl bg-[#F2E8ED] flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#ED1280]" strokeWidth={2} />
            </span>
            <span className="flex-1">
              <span className="block text-[14px] font-semibold text-[#1F1F1F]">
                {title}
              </span>
              <span className="block text-[12px] text-[#65799A] mt-0.5">
                {description}
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-[#95959D] group-hover:text-[#ED1280] transition-colors" />
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center mt-6">
        <label className="text-xs md:text-sm text-[#475467]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#0867AC] hover:text-[#0867AC]">
            Log in
          </Link>
        </label>
      </div>
    </AuthShell>
  );
};

export default SignupRole;
