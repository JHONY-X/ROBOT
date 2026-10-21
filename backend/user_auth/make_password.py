from random import choice
import string, random


def generate_password(length=12):
    letters = string.ascii_letters
    digits = string.digits
    symbols = string.punctuation

    password = [
        random.choice(letters),
        random.choice(digits),
        random.choice(symbols)
    ]

    all_chars = letters + digits + symbols
    password += [random.choice(all_chars) for _ in range(length - 3)]

    random.shuffle(password)
    return ''.join(password)