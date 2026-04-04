"""Rule-based expense parser — no external API calls."""
import re
from datetime import date, timedelta

CATEGORIES = {
    'food': ['food','lunch','dinner','breakfast','swiggy','zomato','restaurant',
             'cafe','coffee','tea','pizza','burger','biryani','bbq','hotel'],
    'travel': ['uber','ola','auto','taxi','fuel','petrol','diesel','cab',
               'flight','train','bus','metro','travel'],
    'bills': ['electricity','water','gas','internet','wifi','phone','mobile',
              'recharge','bill','rent','emi','insurance'],
    'shopping': ['amazon','flipkart','myntra','clothes','shoes','grocery',
                 'vegetables','fruits','market','mall','shop'],
    'health': ['medicine','pharmacy','doctor','hospital','gym','clinic'],
    'entertainment': ['netflix','prime','hotstar','movie','cinema','game'],
}

async def parse_expense(text: str) -> dict:
    text_lower = text.lower()

    # Extract amount
    amount_match = re.search(r'(?:₹|rs\.?|rupees?)?\s*(\d+(?:\.\d{1,2})?)', text_lower)
    amount = float(amount_match.group(1)) if amount_match else 0.0

    # Infer category
    category = 'Others'
    for cat, keywords in CATEGORIES.items():
        if any(kw in text_lower for kw in keywords):
            category = cat.title()
            break

    # Extract date
    expense_date = date.today()
    if 'yesterday' in text_lower:
        expense_date = date.today() - timedelta(days=1)
    elif 'last week' in text_lower:
        expense_date = date.today() - timedelta(days=7)

    # Extract description
    description = re.sub(r'(?:₹|rs\.?|rupees?)\s*\d+(?:\.\d+)?', '', text)
    description = re.sub(r'\b(spent|paid|bought|yesterday|today)\b', '', description, flags=re.IGNORECASE).strip()
    description = ' '.join(description.split())
    if not description:
        description = text[:100]

    return {
        'amount': amount,
        'category': category,
        'description': description[:200],
        'date': expense_date.isoformat(),
    }
