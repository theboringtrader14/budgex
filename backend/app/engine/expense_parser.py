"""Rule-based expense parser — no external API calls."""
import re
from datetime import date, timedelta

WORD_NUMBERS = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
    'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
    'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'hundred': 100, 'thousand': 1000, 'lakh': 100000,
}


def words_to_number(text: str) -> str:
    words = text.lower().split()
    result = []
    i = 0
    current = 0
    found_number = False
    while i < len(words):
        word = words[i].rstrip(',')
        if word in WORD_NUMBERS:
            found_number = True
            val = WORD_NUMBERS[word]
            if val == 100:
                current = current * 100 if current else 100
            elif val in (1000, 100000):
                current = (current or 1) * val
                result.append(str(int(current)))
                current = 0
            else:
                current += val
        else:
            if found_number and current:
                result.append(str(int(current)))
                current = 0
                found_number = False
            result.append(words[i])
        i += 1
    if current:
        result.append(str(int(current)))
    return ' '.join(result)


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
    text = words_to_number(text)
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
